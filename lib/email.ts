import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email credentials missing in .env.local! Skipping email delivery to:", to);
      return false;
    }

    await transporter.sendMail({
      from: `"StudentConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (err) {
    console.error("❌ Failed to send email via Nodemailer:", err);
    return false;
  }
}

// ==============================================================
// BEAUTIFUL HTML EMAIL TEMPLATES
// ==============================================================

const baseHtml = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', -apple-system, sans-serif; background-color: #050508; color: #ffffff; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #111118; border: 1px solid #ffffff10; border-radius: 24px; padding: 40px; }
  .logo { font-size: 24px; font-weight: 900; background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 30px; }
  .btn { display: inline-block; padding: 14px 28px; background: #10b981; color: #000000 !important; font-weight: 800; text-decoration: none; border-radius: 12px; margin-top: 20px; }
  .footer { margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <div class="logo">StudentConnect</div>
    ${content}
    <div class="footer">
      © ${new Date().getFullYear()} StudentConnect. All rights reserved.<br/>
      Building the future of student careers.
    </div>
  </div>
</body>
</html>
`;

export async function sendWelcomeEmail(to: string, name: string, role: string) {
  const content = `
    <h1 style="margin-top:0;">Welcome to StudentConnect, ${name}! 🎉</h1>
    <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
      We're thrilled to have you on board. You're now part of a growing community connecting ambitious students with forward-thinking employers.
    </p>
    <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
      ${role === 'student' ? 'Complete your profile to unlock jobs and start earning.' : 'Post your first job to find top student talent.'}
    </p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" class="btn">Get Started</a>
  `;
  return sendEmail({ to, subject: "Welcome to StudentConnect! 🚀", html: baseHtml(content) });
}

export async function sendApplicationUpdateEmail(to: string, name: string, jobTitle: string, status: string, companyName: string) {
  const statusColors: any = { shortlisted: '#3b82f6', selected: '#10b981', rejected: '#f43f5e' };
  const color = statusColors[status] || '#10b981';
  
  const content = `
    <h1 style="margin-top:0;">Application Update</h1>
    <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
      Hi ${name}, your application for <strong>${jobTitle}</strong> at ${companyName} has been updated.
    </p>
    <div style="background: ${color}20; border: 1px solid ${color}40; padding: 15px; border-radius: 12px; margin: 20px 0;">
      Status: <strong style="color: ${color}; text-transform: uppercase;">${status}</strong>
    </div>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/student/applications" class="btn">View Application</a>
  `;
  return sendEmail({ to, subject: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}: ${jobTitle}`, html: baseHtml(content) });
}

export async function sendNewApplicantEmail(to: string, employerName: string, studentName: string, jobTitle: string) {
  const content = `
    <h1 style="margin-top:0;">New Candidate Alert! 📬</h1>
    <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
      Hi ${employerName}, you have a new applicant.
    </p>
    <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
      <strong>${studentName}</strong> just applied for your <strong>${jobTitle}</strong> position.
    </p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/employer/applicants" class="btn">Review Applicant</a>
  `;
  return sendEmail({ to, subject: `New Applicant: ${jobTitle}`, html: baseHtml(content) });
}
