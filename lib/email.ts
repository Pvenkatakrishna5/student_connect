import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_123");

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
    const { error } = await resend.emails.send({
      from: "StudentConnect <noreply@studentconnect.app>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}
