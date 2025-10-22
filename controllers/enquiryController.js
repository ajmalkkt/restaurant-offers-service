import { sendEmail } from "../utils/emailService.js";
import Enquiry from "../models/Enquiry.js";

export const sendEnquiryEmail = async (req, res) => {
  try {
    const { details } = req.body;
    // Here you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log(`Enquiry received : ${details}`);
    const name = "BrowseQtr";
    const email = "no-reply@browseqtr.com";
    const message = details;
    // 1-Save enquiry to MongoDB
    const newEnquiry = new Enquiry({ name, email, message });
    await newEnquiry.save();
    //2- Simulate email sending
    //res.json({ success: true, message: "Enquiry sent successfully" });
    const result = await sendEmail(name, email, message);

    if (result.success) {
      res.status(200).json({ message: "Enquiry sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send enquiry" });
    }
  } catch (err) {
    console.error("Error sending enquiry email:", err);
    res.status(500).json({ error: err.message });
  }
};

