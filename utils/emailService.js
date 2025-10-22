import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an enquiry email to the configured business address
 * @param {string} name - Name of the user submitting the enquiry
 * @param {string} email - User's email
 * @param {string} message - Enquiry message content
 */
export const sendEmail = async (name, email, message) => {
  const msg = {
    to: process.env.ENQUIRY_EMAIL, // recipient
    from: process.env.FROM_EMAIL, // verified sender
    subject: `New Enquiry from ${name}`,
    html: `
      <h3>New Enquiry Received</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Enquiry email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send enquiry email:", error);
    return { success: false, error };
  }
};
