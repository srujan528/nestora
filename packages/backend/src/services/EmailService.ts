import sgMail from '@sendgrid/mail';

class EmailService {
  setApiKey() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendVerificationCode(to: string, code: number) {
    if (!process.env.SENDGRID_API_KEY) return;
    this.setApiKey();
    const msg = {
      to,
      from: 'support@nestora.in',
      subject: 'Nestora Email Verification Code',
      text: `Your email verification code is ${code}.`,
    };
    await sgMail.send(msg);
  }
}

export const emailService = new EmailService();
