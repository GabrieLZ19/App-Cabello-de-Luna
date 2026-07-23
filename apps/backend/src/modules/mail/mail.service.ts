import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Transporte SMTP configurado para ${smtpUser}`);
    } else {
      this.logger.log('SMTP no configurado. Los códigos OTP se imprimirán en consola en modo desarrollo.');
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
    this.logger.log(`[CÓDIGO VERIFICACIÓN OTP] Destinatario: ${toEmail} | Código: ${otpCode}`);

    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"Instituto ILTCT" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Código de Verificación de Cuenta - ILTCT',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0C0A07; color: #FFFFFF; padding: 30px; borderRadius: 16px;">
            <h2 style="color: #C9A45C; margin-bottom: 10px;">Instituto Latinoamericano de Tricología</h2>
            <p style="color: #B0A894; font-size: 14px;">Tu código de verificación de 6 dígitos es:</p>
            <div style="background-color: #15100A; border: 1px solid #C9A45C; display: inline-block; padding: 14px 28px; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #FFFFFF; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="color: #897F6B; font-size: 12px;">Este código vence en 15 minutos. Si no solicitaste este código, podés ignorar este mensaje.</p>
          </div>
        `,
      });
      this.logger.log(`Correo enviado con éxito a ${toEmail}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Error enviando correo SMTP a ${toEmail}: ${err.message}`);
      return false;
    }
  }
}
