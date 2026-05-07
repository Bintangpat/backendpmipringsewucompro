import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your Password',
        html: `<p>Klik link berikut untuk melakukan reset password Anda:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Link ini berlaku selama 1 jam.</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
