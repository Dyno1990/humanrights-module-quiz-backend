const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, /* StandardFonts */ } = require("pdf-lib");
const allowedOrigins = ["https://rights-in-motion.org","https://safeguarding-module-quiz.vercel.app"];

const CERTIFICATE_NAME = "HR-CERTIFICATE-RIGHTS-IN-MOTION"; // Replace with your actual PDF template name (no extension)

module.exports = async (req, res) => {

  const origin = req.headers.origin

  // Added CORS headers
  if (allowedOrigins.includes(origin)){
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  //Added OPTIONS handling
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const pdfTemplatePath = path.join(__dirname, `assets/${CERTIFICATE_NAME}.pdf`);

    // Load Roboto Bold (supports Cyrillic)
    const fontPath = path.join(__dirname, "assets", "Roboto-Bold.ttf");
    const fontBytes = fs.readFileSync(fontPath);

    const existingPdfBytes = fs.readFileSync(pdfTemplatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    /*
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    */

    // === Embed the custom Cyrillic font ===
    const robotoFont = await pdfDoc.embedFont(fontBytes, { subset: true });

    firstPage.drawText(name, {
      x: 150,
      y: 280,
      size: 24,
      /*
      font: helveticaFont,
      */
      font: robotoFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Human Rights Certificate",
      text: "Attached is your personalized Human Rights certificate.",
      attachments: [
        {
          filename: "certificate.pdf",
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email." });
  }
};
