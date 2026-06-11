export type AuthEmailData = {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
};

const SUBJECTS: Record<string, string> = {
  recovery: 'Reset your Gamer Stronghold password',
  signup: 'Confirm your Gamer Stronghold account',
  magiclink: 'Your Gamer Stronghold sign-in link',
  invite: "You've been invited to Gamer Stronghold",
  email_change: 'Confirm your new email address',
};

const HEADINGS: Record<string, string> = {
  recovery: 'Reset your password',
  signup: 'Confirm your email',
  magiclink: 'Sign in to Gamer Stronghold',
  invite: 'Accept your invitation',
  email_change: 'Confirm your new email',
};

const BODY_COPY: Record<string, string> = {
  recovery: 'We received a request to reset your password. Click the button below to choose a new one. This link expires shortly and can only be used once.',
  signup: 'Thanks for signing up. Confirm your email address to start playing.',
  magiclink: 'Use the button below to sign in to your account.',
  invite: 'You have been invited to join Gamer Stronghold. Click below to create your account.',
  email_change: 'Confirm your new email address to finish updating your account.',
};

const BUTTON_LABELS: Record<string, string> = {
  recovery: 'Reset Password',
  signup: 'Confirm Email',
  magiclink: 'Sign In',
  invite: 'Accept Invitation',
  email_change: 'Confirm Email',
};

export function buildConfirmationUrl(supabaseUrl: string, emailData: AuthEmailData): string {
  const params = new URLSearchParams({
    token: emailData.token_hash,
    type: emailData.email_action_type,
    redirect_to: emailData.redirect_to,
  });

  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`;
}

export function getEmailSubject(actionType: string): string {
  return SUBJECTS[actionType] ?? 'Gamer Stronghold account notification';
}

export function buildAuthEmailContent(actionType: string, confirmationUrl: string) {
  const heading = HEADINGS[actionType] ?? 'Account notification';
  const body = BODY_COPY[actionType] ?? 'Follow the link below to continue.';
  const buttonLabel = BUTTON_LABELS[actionType] ?? 'Continue';

  const htmlContent = `
    <div style="font-family: Inter, Arial, sans-serif; background:#020617; color:#e2e8f0; padding:32px;">
      <div style="max-width:520px; margin:0 auto; background:#0f172a; border:1px solid #1e293b; border-radius:16px; padding:32px;">
        <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.2em; text-transform:uppercase; color:#818cf8;">Gamer Stronghold</p>
        <h1 style="margin:0 0 16px; font-size:24px; color:#ffffff;">${heading}</h1>
        <p style="margin:0 0 24px; line-height:1.6; color:#94a3b8;">${body}</p>
        <a href="${confirmationUrl}" style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; font-weight:700; padding:12px 20px; border-radius:8px;">
          ${buttonLabel}
        </a>
        <p style="margin:24px 0 0; font-size:12px; line-height:1.6; color:#64748b;">
          If the button does not work, copy and paste this link into your browser:<br />
          <a href="${confirmationUrl}" style="color:#818cf8; word-break:break-all;">${confirmationUrl}</a>
        </p>
      </div>
    </div>
  `.trim();

  const textContent = `${heading}\n\n${body}\n\n${confirmationUrl}`;

  return { htmlContent, textContent, heading, buttonLabel };
}

export function getTemplateIdForAction(actionType: string): number | undefined {
  const envKey = `BREVO_${actionType.toUpperCase()}_TEMPLATE_ID`;
  const raw = Deno.env.get(envKey);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildTemplateParams(
  actionType: string,
  confirmationUrl: string,
  emailData: AuthEmailData,
) {
  const { heading, buttonLabel } = buildAuthEmailContent(actionType, confirmationUrl);

  return {
    ACTION_TYPE: actionType,
    CONFIRMATION_URL: confirmationUrl,
    REDIRECT_TO: emailData.redirect_to,
    HEADING: heading,
    BUTTON_LABEL: buttonLabel,
    OTP_TOKEN: emailData.token,
  };
}
