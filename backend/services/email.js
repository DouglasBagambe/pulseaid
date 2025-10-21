const nodemailer = require("nodemailer");

// Create transporter (will be configured via environment variables)
let transporter = null;

if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password for Gmail
    },
  });
  console.log("[Email] Email service configured");
} else {
  console.warn("[Email] Email service not configured. Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS in .env");
}

async function sendCampaignApprovalEmail(campaignTitle, creatorEmail) {
  if (!transporter) {
    console.warn("[Email] Cannot send email - transporter not configured");
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: creatorEmail,
      subject: `✅ Your Campaign "${campaignTitle}" Has Been Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #35D07F;">🎉 Congratulations!</h2>
          <p>Your campaign <strong>"${campaignTitle}"</strong> has been approved by our admin team.</p>
          <p>Your campaign is now live and accepting donations!</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #35D07F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Your Campaign
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from PulseAid by <a href="https://nilebitlabs.com" style="color: #35D07F;">NileBit Labs</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Approval email sent to ${creatorEmail}`);
  } catch (error) {
    console.error("[Email] Failed to send approval email:", error.message);
  }
}

async function sendCampaignRejectionEmail(campaignTitle, creatorEmail, reason) {
  if (!transporter) {
    console.warn("[Email] Cannot send email - transporter not configured");
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: creatorEmail,
      subject: `Campaign "${campaignTitle}" - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">Campaign Update</h2>
          <p>We regret to inform you that your campaign <strong>"${campaignTitle}"</strong> could not be approved at this time.</p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid: #ffc107; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Reason:</h3>
            <p style="margin-bottom: 0;">${reason || 'Please review our campaign guidelines and try again.'}</p>
          </div>
          
          <p>If you have questions or would like to resubmit your campaign, please contact our support team.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from PulseAid by <a href="https://nilebitlabs.com" style="color: #35D07F;">NileBit Labs</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Rejection email sent to ${creatorEmail}`);
  } catch (error) {
    console.error("[Email] Failed to send rejection email:", error.message);
  }
}

module.exports = {
  sendCampaignApprovalEmail,
  sendCampaignRejectionEmail,
};
