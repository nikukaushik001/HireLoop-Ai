import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

// Initialize Nodemailer transporter with AWS SES
// Ensure AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set in .env
let transporter: nodemailer.Transporter;

try {
  const sesClient = new SESv2Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
  });

  transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand },
  } as any);
} catch (error) {
  console.warn("⚠️ Warning: AWS SES credentials not configured properly in .env");
}

export class EmailService {
  async sendMail(options: { to: string; subject: string; text: string; html: string }) {
    const fromAddress = process.env.SMTP_FROM || process.env.SES_FROM_EMAIL || 'hireloop.ai@gmail.com';
    
    try {
      const info = await transporter.sendMail({
        from: `"HireLoop-AI" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      console.log(`[Email Sent via SMTP] Message ID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('[SMTP Email Error] Failed to send email:', err);
      throw err;
    }
  }

  /**
   * Notification to recruiter when resume processing finishes.
   */
  async sendRecruiterUploadSummary(
    recruiterEmail: string,
    jobTitle: string,
    successCount: number,
    failedCount: number,
    candidates: string[]
  ) {
    const subject = `📊 [HireLoop-AI] Resume Processing Completed for ${jobTitle}`;
    const text = `Hello Recruiter,

Resume processing has completed for the position: "${jobTitle}".

Summary:
- Successfully Processed: ${successCount} candidate(s)
- Failed: ${failedCount} candidate(s)

Parsed Candidates:
${candidates.length > 0 ? candidates.map(c => `- ${c}`).join('\n') : 'None'}

You can now view the ranked list of candidates on your dashboard.

Best regards,
HireLoop-AI Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Resume Processing Complete</h2>
        <p>Hello Recruiter,</p>
        <p>Resume processing has completed for the position: <strong>${jobTitle}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Successfully Processed</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #10b981; font-weight: bold;">${successCount}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Failed</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444; font-weight: bold;">${failedCount}</td>
          </tr>
        </table>

        ${candidates.length > 0 ? `
        <h4 style="margin-bottom: 8px;">Parsed Candidates:</h4>
        <ul style="padding-left: 20px; margin-top: 0;">
          ${candidates.map(c => `<li>${c}</li>`).join('')}
        </ul>
        ` : ''}

        <p style="margin-top: 24px;">
          <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/ranking" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Ranked Candidates</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification from HireLoop-AI. Please do not reply directly to this email.</p>
      </div>
    `;

    return this.sendMail({ to: recruiterEmail, subject, text, html });
  }

  /**
   * Notification to candidate when shortlisted.
   */
  async sendCandidateShortlistNotification(candidateEmail: string, candidateName: string, jobTitle: string) {
    const subject = `🎉 Congratulations! You have been shortlisted for the ${jobTitle} position at HireLoop-AI`;
    const text = `Hello ${candidateName},

We are pleased to inform you that your resume has been shortlisted for the position of "${jobTitle}".

Our recruitment team will contact you shortly to schedule the next rounds of interviews.

Best regards,
HireLoop-AI Recruitment Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #10b981; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Application Shortlisted</h2>
        <p>Hello <strong>${candidateName}</strong>,</p>
        <p>We are pleased to inform you that your resume has been shortlisted for the position of <strong>${jobTitle}</strong>.</p>
        <p>Our recruitment team is impressed by your profile and will contact you shortly to schedule the next rounds of interviews.</p>
        <p>Thank you for your interest in joining our team!</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">HireLoop-AI Talent Acquisition team</p>
      </div>
    `;

    return this.sendMail({ to: candidateEmail, subject, text, html });
  }

  /**
   * Notification to candidate when interview is scheduled.
   */
  async sendInterviewScheduled(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    scheduledAt: Date,
    meetingLink?: string,
    interviewerName?: string
  ) {
    const formattedDate = scheduledAt.toLocaleString();
    const subject = `🗓️ Interview Scheduled: ${jobTitle} Position`;
    const text = `Hello ${candidateName},

An interview has been scheduled for you for the "${jobTitle}" position.

Details:
- Date & Time: ${formattedDate}
- Interviewer: ${interviewerName || 'Recruitment Team'}
${meetingLink ? `- Meeting Link: ${meetingLink}` : ''}

Please join the meeting on time. If you need to reschedule, please notify us as soon as possible.

Best regards,
HireLoop-AI Recruitment Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Interview Invitation</h2>
        <p>Hello <strong>${candidateName}</strong>,</p>
        <p>An interview has been scheduled for you for the position of <strong>${jobTitle}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; margin-bottom: 10px; color: #3b82f6;">Interview Details</h4>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Interviewer:</strong> ${interviewerName || 'Recruitment Team'}</p>
          ${meetingLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank">${meetingLink}</a></p>` : ''}
        </div>

        <p>Please make sure to join the link on time. If you have any conflicts, reply to this email to request a reschedule.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">HireLoop-AI Recruitment Team</p>
      </div>
    `;

    return this.sendMail({ to: candidateEmail, subject, text, html });
  }

  /**
   * Notification to candidate when interview feedback is submitted.
   */
  async sendInterviewFeedbackNotification(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    status: string
  ) {
    const subject = `📝 Application Update: ${jobTitle} Position`;
    const text = `Hello ${candidateName},

We would like to thank you for participating in the interview for the "${jobTitle}" position.

Your interview feedback has been submitted, and your application status has been updated to: ${status}.

We will contact you with the next steps shortly.

Best regards,
HireLoop-AI Recruitment Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Application Update</h2>
        <p>Hello <strong>${candidateName}</strong>,</p>
        <p>Thank you for taking the time to interview with us for the <strong>${jobTitle}</strong> position.</p>
        <p>Your interviewer feedback has been received and reviewed by the recruitment team. Your application status is currently: <strong>${status}</strong>.</p>
        <p>We will reach out to you directly for the next steps.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">HireLoop-AI Recruitment Team</p>
      </div>
    `;

    return this.sendMail({ to: candidateEmail, subject, text, html });
  }

  /**
   * Notification for password reset
   */
  async sendPasswordReset(userEmail: string, userName: string, resetUrl: string) {
    const subject = `🔒 Password Reset Request - HireLoop-AI`;
    const text = `Hello ${userName},\n\nYou requested a password reset. Please click the link below to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    const html = `<p>Hello <strong>${userName}</strong>,</p><p>You requested a password reset. Please click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`;
    return this.sendMail({ to: userEmail, subject, text, html });
  }
}
