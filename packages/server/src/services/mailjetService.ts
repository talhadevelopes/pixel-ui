import axios from "axios";

const MAILJET_API_KEY = process.env.MAILJET_API_KEY || "";
const MAILJET_API_SECRET = process.env.MAILJET_API_SECRET || "";
const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL || "trainedbot10k@gmail.com";
const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || "TopperFriend";

function buildAuthHeader(): string {
  const token = Buffer.from(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export async function sendVerificationEmail(toEmail: string, toName: string, otp: string) {
  const subject = "Your Verification Code";
  const text = `Hello ${toName},\n\nYour verification code is: ${otp}\n\nCode expires in 10 minutes.\n`;
  const html = `<div style=\"font-family: Arial, sans-serif;max-width: 600px;margin: 0 auto;color: #333;\">` +
    `<h2>Your Verification Code</h2>` +
    `<p>Hello ${toName},</p>` +
    `<p>Use this code to verify your email:</p>` +
    `<div style=\"background: #f0f5ff;border: 2px dashed #4a90e2;padding: 20px;text-align: center;font-size: 28px;font-weight: bold;letter-spacing: 3px;margin: 25px 0;color: #1a365d;\">${otp}</div>` +
    `<p style=\"font-size: 14px; color: #666;\">Expires in 10 minutes • Do not share this code</p>` +
    `</div>`;

  const payload = {
    Messages: [
      {
        From: { Email: MAILJET_FROM_EMAIL, Name: MAILJET_FROM_NAME },
        To: [{ Email: toEmail, Name: toName }],
        Subject: subject,
        TextPart: text,
        HTMLPart: html,
      },
    ],
  };

  const resp = await axios.post("https://api.mailjet.com/v3.1/send", payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: buildAuthHeader(),
    },
  });

  if (resp.status >= 400) {
    throw new Error(`Mailjet send failed: ${resp.status} - ${resp.statusText}`);
  }
}
