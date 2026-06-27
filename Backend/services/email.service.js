import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, fullname, otp) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Messenger App <onboarding@resend.dev>",
          to: email,
          subject: "Verify Your Email - Messenger App",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #2563eb; text-align: center;">Welcome to Messenger!</h2>
              <p>Hi <strong>${fullname}</strong>,</p>
              <p>Thank you for registering. Please verify your email address by entering the One-Time Password (OTP) code below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px;">
                  ${otp}
                </span>
              </div>
              <p style="color: #64748b; font-size: 14px;">This code is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">Messenger App Team &copy; 2026</p>
            </div>
          `,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`Verification OTP email sent via Resend API to ${email}`);
        return true;
      }
      console.error("Resend API error response:", data);
    } catch (error) {
      console.error("Error sending verification email via Resend API:", error);
    }
  }

  // 2. Fallback: SMTP with Nodemailer (works locally, but will time out on Render Free tier)
  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Messenger App" <${emailUser}>`,
        to: email,
        subject: "Verify Your Email - Messenger App",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">Welcome to Messenger!</h2>
            <p>Hi <strong>${fullname}</strong>,</p>
            <p>Thank you for registering. Please verify your email address by entering the One-Time Password (OTP) code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">Messenger App Team &copy; 2026</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Verification OTP email sent via SMTP to ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending verification email via SMTP:", error);
    }
  }

  // 3. Dev Fallback: If no API key and no SMTP credentials, or if both failed
  console.log(`\n==================================================`);
  console.log(`[DEV FALLBACK] Verification OTP for ${email} (${fullname}) is: ${otp}`);
  console.log(`==================================================\n`);
  return true;
};

