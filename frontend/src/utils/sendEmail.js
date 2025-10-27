import emailjs from "@emailjs/browser";

export const sendEmailToSeller = async (sellerEmail, buyerName, message) => {
  try {
    const params = {
      to_email: sellerEmail, // matches {{to_email}} (To Email)
      name: buyerName,       // matches {{name}} (From Name)
      reply_to: buyerEmail,     // matches {{email}} (Reply To)
      message: message,      // matches {{message}} (Body)
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      params,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};
