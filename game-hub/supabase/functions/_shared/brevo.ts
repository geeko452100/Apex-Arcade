export type BrevoRecipient = {
  email: string;
  name?: string;
};

export type SendBrevoEmailOptions = {
  to: BrevoRecipient[];
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, string>;
};

export async function sendBrevoEmail(options: SendBrevoEmailOptions): Promise<void> {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL');
  const senderName = Deno.env.get('BREVO_SENDER_NAME') ?? 'Gamer Stronghold';

  if (!apiKey || !senderEmail) {
    throw new Error('Missing BREVO_API_KEY or BREVO_SENDER_EMAIL');
  }

  const body: Record<string, unknown> = options.templateId
    ? {
        templateId: options.templateId,
        to: options.to,
        params: options.params ?? {},
      }
    : {
        sender: { name: senderName, email: senderEmail },
        to: options.to,
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
      };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = typeof errorBody?.message === 'string'
      ? errorBody.message
      : `Brevo request failed (${response.status})`;
    throw new Error(message);
  }
}
