import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as Handlebars from "handlebars";
import * as juice from "juice";
import type { Attachment } from "nodemailer/lib/mailer";

@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter | null = null;

  // Registro simple de plantillas en memoria
  private templates: Record<string, { subject: string; html: string }> = {
    welcome: {
      subject: "¡Bienvenido/a a {{appName}}!",
      html: `
      <style>
        .card{max-width:600px;margin:0 auto;padding:24px;border-radius:16px;border:1px solid #eee;font-family:Arial,Helvetica,sans-serif}
        .title{font-size:24px;font-weight:700;margin:0 0 8px}
        .subtitle{font-size:16px;margin:0 0 16px;color:#555}
        .btn{display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none}
        .footer{font-size:12px;color:#888;margin-top:24px}
      </style>
      <div class="card">
        <h1 class="title">Hola {{name}}</h1>
        <p class="subtitle">¡Bienvenida a <b>{{appName}}</b>! 💪</p>
        <p>Tu cuenta ya está lista. Si no fuiste tú, ignora este mensaje.</p>
        {{#if ctaUrl}}
          <p><a class="btn" href="{{ctaUrl}}">Entrar a {{appName}}</a></p>
        {{/if}}
        <div class="footer">
          Enviado por {{appName}} · <a href="{{baseUrl}}">Ir al sitio</a>
        </div>
      </div>
      `,
    },
    reset_password: {
      subject: "Restablecer contraseña - {{appName}}",
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto">
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Para continuar, haz clic en el siguiente enlace:</p>
        <p><a href="{{resetLink}}">{{resetLink}}</a></p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      </div>
      `,
    },
    subscription_expiry_7d: {
      subject: "Tu membresía TrainUp vence en 7 días",
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto">
        <h2>Hola {{name}},</h2>
        <p>Tu membresía de <b>{{appName}}</b> vence el <strong>{{endDate}}</strong>.</p>
        <p>Para evitar interrupciones, renueva ahora desde tu panel.</p>
        <p>¡Seguimos entrenando! 💪</p>
        <div style="font-size:12px;color:#888;margin-top:24px">
          Enviado por {{appName}} · <a href="{{baseUrl}}">Ir al sitio</a>
        </div>
      </div>
    `,
    },
    benefits_nudge: {
      subject: "Aprovecha al máximo tu suscripción ✨",
      html: `
      <style>
        .card{max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;font-family:Arial,Helvetica,sans-serif}
        .title{font-size:22px;font-weight:700;margin:0 0 8px}
        .p{font-size:16px;color:#444;line-height:1.5}
        .btn{display:inline-block;margin-top:14px;padding:12px 18px;border-radius:8px;text-decoration:none;background:#111;color:#fff}
        .footer{font-size:12px;color:#888;margin-top:24px}
      </style>
      <div class="card">
        <h1 class="title">¡Hola {{name}}!</h1>
        <p class="p">Recuerda que con tu suscripción tienes acceso a distintos beneficios.</p>
        <a class="btn" href="{{discoverUrl}}" target="_blank" rel="noreferrer">Descubre TrainUp</a>
        <div class="footer">Enviado por {{appName}} · <a href="{{baseUrl}}">Ir al sitio</a></div>
      </div>
      `,
    },
    payment_ok: {
      subject: "¡Pago confirmado! 🎉 Tu suscripción ya está activa",
      html: `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto">
    <h2>¡Gracias por tu pago, {{name}}!</h2>
    <p>Tu suscripción al plan <b>{{planName}}</b> ya está activa.</p>
    <p>Monto: <b>{{amount}}</b></p>
    <p>ID de pago: <b>{{paymentId}}</b></p>
    <p><a href="{{baseUrl}}">Entrar a {{appName}}</a></p>
    </div>
  `,
    },
  };

  private initTransporter() {
    if (this.transporter) return;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new InternalServerErrorException(
        "Faltan variables SMTP: revisa SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 SSL, 587 STARTTLS
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      socketTimeout: 15000,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      tls: { ciphers: "TLSv1.2" },
    } as SMTPTransport.Options);
  }

  async verifyConnection() {
    this.initTransporter();
    return this.transporter!.verify();
  }

  async send(
    to: string,
    subject: string,
    html: string,
    attachments?: Attachment[],
  ) {
    this.initTransporter();
    const from = process.env.MAIL_FROM || "TrainUp <no-reply@trainup.local>";
    try {
      const info = await this.transporter!.sendMail({
        from,
        to,
        subject,
        html: juice(html), // estilos inline para mejor render
        attachments,
      });
      return { ok: true, messageId: info.messageId };
    } catch {
      throw new InternalServerErrorException("No se pudo enviar el correo");
    }
  }

  async renderTemplate(key: string, data: Record<string, any> = {}) {
    const tpl = this.templates[key];
    if (!tpl) throw new NotFoundException(`Template "${key}" no existe`);

    const baseData = {
      appName: process.env.APP_NAME || "TrainUp",
      baseUrl: process.env.FRONT_ORIGIN || "http://localhost:3000",
      ...data,
    };

    const subject = Handlebars.compile(tpl.subject)(baseData);
    const htmlRaw = Handlebars.compile(tpl.html)(baseData);
    const html = juice(htmlRaw);

    return { subject, html };
  }

  async sendByTemplate(
    to: string,
    key: string,
    data: Record<string, any> = {},
    attachments?: Attachment[],
  ) {
    const { subject, html } = await this.renderTemplate(key, data);
    return this.send(to, subject, html, attachments);
  }

  async sendWelcome(to: string, name: string) {
    return this.sendByTemplate(to, "welcome", {
      name,
      ctaUrl: `${process.env.FRONT_ORIGIN || "http://localhost:3000"}/login`,
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    return this.sendByTemplate(to, "reset_password", { resetLink });
  }
}
