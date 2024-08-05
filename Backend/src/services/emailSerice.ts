import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // generated app password
  },
});

// Function to send email
export const sendEmail = async (to: string, subject: string, body: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: body,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
