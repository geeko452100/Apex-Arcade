import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { sendBrevoEmail } from '../_shared/brevo.ts';
import {
  buildAuthEmailContent,
  buildConfirmationUrl,
  buildTemplateParams,
  getEmailSubject,
  getTemplateIdForAction,
  type AuthEmailData,
} from '../_shared/authEmails.ts';

type SendEmailHookPayload = {
  user: {
    email: string;
  };
  email_data: AuthEmailData;
};

function getHookSecret(): string {
  const secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
  return secret.replace('v1,whsec_', '');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const hookSecret = getHookSecret();
  if (!hookSecret) {
    return Response.json(
      { error: { message: 'Missing SEND_EMAIL_HOOK_SECRET' } },
      { status: 500 },
    );
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    const webhook = new Webhook(hookSecret);
    const { user, email_data: emailData } = webhook.verify(payload, headers) as SendEmailHookPayload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const confirmationUrl = buildConfirmationUrl(supabaseUrl, emailData);
    const actionType = emailData.email_action_type;
    const templateId = getTemplateIdForAction(actionType);
    const subject = getEmailSubject(actionType);

    if (templateId) {
      await sendBrevoEmail({
        to: [{ email: user.email }],
        templateId,
        params: buildTemplateParams(actionType, confirmationUrl, emailData),
      });
    } else {
      const { htmlContent, textContent } = buildAuthEmailContent(actionType, confirmationUrl);

      await sendBrevoEmail({
        to: [{ email: user.email }],
        subject,
        htmlContent,
        textContent,
      });
    }

    return Response.json({});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send auth email';

    return Response.json(
      {
        error: {
          http_code: 500,
          message,
        },
      },
      { status: 500 },
    );
  }
});
