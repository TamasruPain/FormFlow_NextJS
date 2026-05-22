import nodemailer from "nodemailer";
import { FieldDefinition } from "@/types/form";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser || "noreply@formflow.dev";

// Reusable Nodemailer transporter (instantiated only if credentials exist)
const getTransporter = () => {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

interface SendSubmissionNotificationProps {
  ownerEmail: string;
  ownerName: string;
  formTitle: string;
  formId: string;
  responseId: string;
  schema: FieldDefinition[];
  submittedData: Record<string, any>;
}

export async function sendSubmissionNotification({
  ownerEmail,
  ownerName,
  formTitle,
  formId,
  responseId,
  schema,
  submittedData,
}: SendSubmissionNotificationProps) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      "[EMAIL_SERVICE_WARNING] SMTP credentials are not configured. Skipping email notification."
    );
    return false;
  }

  // Format the answers as a clean list for the email body
  const answersListHtml = schema
    .map((field) => {
      const val = submittedData[field.id];
      let displayVal = "N/A";

      if (val !== undefined && val !== null && val !== "") {
        if (Array.isArray(val)) {
          displayVal = val.join(", ");
        } else if (typeof val === "boolean") {
          displayVal = val ? "Yes" : "No";
        } else {
          displayVal = String(val);
        }
      }

      return `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">${field.label}</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 500; white-space: pre-wrap;">${displayVal}</p>
      </div>
    `;
    })
    .join("");

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forms/${formId}/responses`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Submission - ${formTitle}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 30px 15px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Banner Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.025em;">FormFlow Notification</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">New response received for your form</p>
          </div>
          
          <!-- Body Content -->
          <div style="padding: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 15px; color: #334155; line-height: 1.5;">
              Hi ${ownerName},
            </p>
            <p style="margin: 0 0 25px 0; font-size: 15px; color: #334155; line-height: 1.5;">
              You have received a new submission on your form <strong>"${formTitle}"</strong>. Here is a summary of the answers:
            </p>
            
            <!-- Answers -->
            <div style="margin-bottom: 30px;">
              ${answersListHtml}
            </div>
            
            <!-- Button Link -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">
                View inside Dashboard
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">This is an automated notification from FormFlow.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} FormFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FormFlow" <${smtpFrom}>`,
      to: ownerEmail,
      subject: `New response on: ${formTitle}`,
      html: htmlContent,
    });

    console.log("[EMAIL_SERVICE_SUCCESS] Notification sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[EMAIL_SERVICE_ERROR] Failed to send email:", error);
    return false;
  }
}

interface SendResetPasswordEmailProps {
  email: string;
  name: string;
  resetLink: string;
}

export async function sendResetPasswordEmail({
  email,
  name,
  resetLink,
}: SendResetPasswordEmailProps) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      "[EMAIL_SERVICE_WARNING] SMTP credentials are not configured. Logging reset link directly."
    );
    console.log(`\n========================================\nPASSWORD RESET LINK FOR ${email}:\n${resetLink}\n========================================\n`);
    return true;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - FormFlow</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 30px 15px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Banner Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.025em;">FormFlow Security</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <!-- Body Content -->
          <div style="padding: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 15px; color: #334155; line-height: 1.5;">
              Hi ${name || "User"},
            </p>
            <p style="margin: 0 0 25px 0; font-size: 15px; color: #334155; line-height: 1.5;">
              We received a request to reset your FormFlow password. Click the button below to secure your account and choose a new password.
            </p>
            
            <!-- Button Link -->
            <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
              <a href="${resetLink}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">
                Reset Password
              </a>
            </div>
            
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #6366f1; word-break: break-all;">
                ${resetLink}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">This is an automated security notification from FormFlow.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} FormFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FormFlow Security" <${smtpFrom}>`,
      to: email,
      subject: "Reset your FormFlow password",
      html: htmlContent,
    });

    console.log("[EMAIL_SERVICE_SUCCESS] Reset password email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[EMAIL_SERVICE_ERROR] Failed to send reset password email:", error);
    return false;
  }
}
