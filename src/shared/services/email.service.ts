import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to,
      subject: 'Your WellDone Verification Code',
      html: `
        <h1>Welcome to WellDone!</h1>
        <p>Your verification code is:</p>
        <h2>${code}</h2>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendTestEmail(to: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to,
      subject: 'WellDone Email Test',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you're reading this, your email configuration is working correctly!</p>
        <p>Configuration details:</p>
        <ul>
          <li>SMTP Host: ${this.configService.get('SMTP_HOST')}</li>
          <li>SMTP Port: ${this.configService.get('SMTP_PORT')}</li>
          <li>From Address: ${this.configService.get('SMTP_FROM')}</li>
        </ul>
      `,
    };

    try {
      await this.transporter.verify();
      console.log('SMTP connection verified');
      await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }
}
