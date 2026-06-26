import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, fullname, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Fallback: If email credentials are not set, log the OTP to the console
  if (!emailUser || !emailPass) {
    console.log(`\n==================================================`);
    console.log(`[DEV FALLBACK] Verification OTP for ${email} (${fullname}) is: ${otp}`);
    console.log(`==================================================\n`);
    return true;
  }

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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 10px;">
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
    console.log(`Verification OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Fallback to logging in console so development does not break if SMTP fails
    console.log(`\n==================================================`);
    console.log(`[SMTP ERROR FALLBACK] OTP for ${email} is: ${otp}`);
    console.log(`==================================================\n`);
    return false;
  }
};
