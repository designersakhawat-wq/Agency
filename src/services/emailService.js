const nodemailer = require('nodemailer');
const env = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        console.log('✅ Email service initialized with SMTP transport.');
      } catch (err) {
        console.warn('⚠️ Failed to initialize SMTP transporter:', err.message);
        this.transporter = null;
      }
    } else {
      console.log('ℹ️ Email credentials not set; email notifications will be logged to console.');
    }
  }

  /**
   * Safe email sender that never crashes or throws uncaught errors
   */
  async sendMail({ to, subject, html, text }) {
    const mailOptions = {
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    };

    // 1. Try Nodemailer SMTP
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error(`⚠️ SMTP dispatch error for ${to}:`, err.message);
      }
    }

    // 2. Try Resend if configured
    if (env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${env.SMTP_FROM_NAME} <onboarding@resend.dev>`,
            to: [to],
            subject,
            html,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          console.log(`📧 Resend email dispatched to ${to}. Id: ${resData.id}`);
          return { success: true, id: resData.id };
        }
      } catch (err) {
        console.error(`⚠️ Resend API dispatch error:`, err.message);
      }
    }

    // 3. Fallback: Log email details cleanly in development / simulation
    console.log(`\n================== [EMAIL DISPATCH LOG] ==================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Note: Configure SMTP_USER and SMTP_PASS in .env for live delivery.`);
    console.log(`==========================================================\n`);

    return { success: false, fallbackLogged: true };
  }

  /**
   * Dispatch Contact Inquiry Notifications (Admin + Client Confirmation)
   */
  async sendInquiryNotification(inquiry) {
    const adminEmail = env.ADMIN_NOTIFICATION_EMAIL || 'designersakhawat@gmail.com';

    // Admin Notification Template
    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🚀 New Project Inquiry Received</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">From your portfolio website</p>
        </div>
        <div style="padding: 28px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600; width: 120px;">Sender Name:</td>
              <td style="padding: 10px 0; color: #fafafa; font-weight: 700;">${inquiry.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Email:</td>
              <td style="padding: 10px 0; color: #818cf8;"><a href="mailto:${inquiry.email}" style="color: #818cf8; text-decoration: none;">${inquiry.email}</a></td>
            </tr>
            ${inquiry.phone ? `
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Phone:</td>
              <td style="padding: 10px 0; color: #fafafa;">${inquiry.phone}</td>
            </tr>` : ''}
            ${inquiry.service ? `
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Service:</td>
              <td style="padding: 10px 0; color: #34d399; font-weight: 600;">${inquiry.service}</td>
            </tr>` : ''}
            ${inquiry.budget ? `
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Budget:</td>
              <td style="padding: 10px 0; color: #fbbf24; font-weight: 600;">${inquiry.budget}</td>
            </tr>` : ''}
          </table>

          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-top: 15px;">
            <p style="color: #a1a1aa; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Message Content:</p>
            <p style="color: #f4f4f5; line-height: 1.6; margin: 0; white-space: pre-wrap;">${inquiry.message}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${inquiry.email}?subject=Re:%20${encodeURIComponent(inquiry.subject || 'Your inquiry to Md Sakhawat Hossain')}" style="background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Reply Directly</a>
          </div>
        </div>
        <div style="background: #121215; padding: 16px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
          Portfolio Inquiries System • Md Sakhawat Hossain
        </div>
      </div>
    `;

    // Client Confirmation Template
    const clientHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">
        <div style="background: #09090b; padding: 28px; text-align: center; color: white;">
          <h2 style="margin: 0; color: #ffffff;">Thank You for Reaching Out!</h2>
          <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">Md Sakhawat Hossain • UI/UX & Product Designer</p>
        </div>
        <div style="padding: 28px;">
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${inquiry.name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
            Thank you for contacting me. I have received your message regarding <strong>${inquiry.service || 'your project'}</strong> and will get back to you within 24 hours.
          </p>
          <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #71717a;"><strong>Your Message:</strong></p>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #27272a; font-style: italic;">"${inquiry.message}"</p>
          </div>
          <p style="font-size: 14px; color: #71717a;">
            In the meantime, feel free to explore my latest design case studies and live demos.
          </p>
          <p style="font-size: 15px; margin-top: 24px; color: #18181b;">
            Best regards,<br>
            <strong>Md Sakhawat Hossain</strong><br>
            <span style="color: #71717a; font-size: 13px;">Senior UI/UX Designer & Developer</span>
          </p>
        </div>
      </div>
    `;

    try {
      await Promise.allSettled([
        this.sendMail({
          to: adminEmail,
          subject: `✨ New Portfolio Inquiry from ${inquiry.name}: ${inquiry.subject || 'Project Discussion'}`,
          html: adminHtml,
        }),
        this.sendMail({
          to: inquiry.email,
          subject: `Inquiry Received - Md Sakhawat Hossain`,
          html: clientHtml,
        }),
      ]);
    } catch (e) {
      console.error('Email dispatch non-fatal failure:', e.message);
    }
  }

  /**
   * Dispatch Meeting Booking Notifications
   */
  async sendBookingNotification(booking) {
    const adminEmail = env.ADMIN_NOTIFICATION_EMAIL || 'designersakhawat@gmail.com';

    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📅 New Meeting Booking</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">Discovery & Consultation Call</p>
        </div>
        <div style="padding: 28px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600; width: 120px;">Client:</td>
              <td style="padding: 10px 0; color: #fafafa; font-weight: 700;">${booking.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Email:</td>
              <td style="padding: 10px 0; color: #60a5fa;"><a href="mailto:${booking.email}" style="color: #60a5fa; text-decoration: none;">${booking.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Date & Time:</td>
              <td style="padding: 10px 0; color: #34d399; font-weight: 700;">${booking.date} at ${booking.timeSlot}</td>
            </tr>
            ${booking.serviceName ? `
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: 600;">Service:</td>
              <td style="padding: 10px 0; color: #fafafa;">${booking.serviceName}</td>
            </tr>` : ''}
          </table>

          ${booking.notes ? `
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 18px; margin-top: 15px;">
            <p style="color: #a1a1aa; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase;">Client Notes:</p>
            <p style="color: #f4f4f5; line-height: 1.6; margin: 0;">${booking.notes}</p>
          </div>` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${booking.email}?subject=Meeting%20Confirmation%20with%20Md%20Sakhawat%20Hossain" style="background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Send Meeting Link</a>
          </div>
        </div>
      </div>
    `;

    const clientHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">
        <div style="background: #09090b; padding: 28px; text-align: center; color: white;">
          <h2 style="margin: 0; color: #ffffff;">Meeting Booking Confirmed!</h2>
          <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">Discovery Consultation with Md Sakhawat Hossain</p>
        </div>
        <div style="padding: 28px;">
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${booking.name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
            Your session has been scheduled successfully! Here are your meeting details:
          </p>
          <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>📅 Date:</strong> ${booking.date}</p>
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>⏰ Time:</strong> ${booking.timeSlot}</p>
            <p style="margin: 0; font-size: 15px;"><strong>🎯 Topic:</strong> ${booking.serviceName || 'Project Consultation'}</p>
          </div>
          <p style="font-size: 14px; color: #71717a;">
            I will send a video meeting link (Google Meet / Zoom) prior to the call. If you need to reschedule, please reply directly to this email.
          </p>
          <p style="font-size: 15px; margin-top: 24px; color: #18181b;">
            Looking forward to speaking with you,<br>
            <strong>Md Sakhawat Hossain</strong>
          </p>
        </div>
      </div>
    `;

    try {
      await Promise.allSettled([
        this.sendMail({
          to: adminEmail,
          subject: `📅 New Booking: ${booking.name} on ${booking.date} at ${booking.timeSlot}`,
          html: adminHtml,
        }),
        this.sendMail({
          to: booking.email,
          subject: `Meeting Scheduled - Md Sakhawat Hossain (${booking.date})`,
          html: clientHtml,
        }),
      ]);
    } catch (e) {
      console.error('Booking email non-fatal failure:', e.message);
    }
  }

  /**
   * Dispatch Direct Meeting Link & Confirmation to Client
   */
  async sendMeetingLinkEmail(booking) {
    if (!booking.email) return;

    const meetUrl = booking.meetingLink || 'https://meet.google.com';

    const clientHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: #09090b; padding: 32px 28px; text-align: center; color: white;">
          <div style="display: inline-block; background: rgba(204, 255, 0, 0.15); border: 1px solid #ccff00; color: #ccff00; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            Consultation Confirmed
          </div>
          <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Your Video Meeting Link is Ready!</h2>
          <p style="color: #a1a1aa; margin: 6px 0 0 0; font-size: 14px;">1-on-1 Discovery Call with Md Sakhawat Hossain</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 28px;">
          <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${booking.name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
            I have confirmed your appointment. Below are your meeting details and the direct video call link:
          </p>

          <!-- Schedule Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 110px;">📅 Date:</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 15px; font-weight: 700;">${booking.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">⏰ Time:</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 15px; font-weight: 700;">${booking.timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">🎯 Focus:</td>
                <td style="padding: 6px 0; color: #059669; font-size: 15px; font-weight: 700;">${booking.serviceName || 'Design Consultation'}</td>
              </tr>
            </table>
          </div>

          <!-- Join Meeting Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${meetUrl}" target="_blank" style="background: #09090b; color: #ccff00; border: 2px solid #ccff00; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
              🎥 Join Video Meeting
            </a>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">
              Direct Link: <a href="${meetUrl}" style="color: #2563eb; text-decoration: underline;">${meetUrl}</a>
            </p>
          </div>

          <!-- Notes / Tips -->
          <div style="background: #f1f5f9; border-radius: 10px; padding: 16px; font-size: 13px; color: #475569; line-height: 1.5;">
            💡 <strong>Preparation Tip:</strong> Please join 2 minutes before the scheduled time. If you have reference files or brand materials, please feel free to have them ready.
          </div>

          <p style="font-size: 15px; margin-top: 28px; margin-bottom: 0; color: #18181b;">
            Looking forward to discussing your project,<br>
            <strong>Md Sakhawat Hossain</strong><br>
            <span style="color: #64748b; font-size: 13px;">Creative Graphic Designer</span>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Need to reschedule? Reply directly to this email or visit <a href="https://scaaleminte.com" style="color: #64748b; text-decoration: underline;">scaaleminte.com</a>
        </div>
      </div>
    `;

    try {
      await this.sendMail({
        to: booking.email,
        subject: `🎥 Meeting Link & Confirmation - Md Sakhawat Hossain (${booking.date})`,
        html: clientHtml,
      });
    } catch (e) {
      console.error('Meeting link email dispatch error:', e.message);
    }
  }
}

module.exports = new EmailService();
