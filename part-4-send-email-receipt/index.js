/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const mailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true,
  post: 465,
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD
  }
});

/*
 * Sends the confirmation email to the customer
 * @param {Object} checkoutSession - a Stripe CheckoutSession
 * https://stripe.com/docs/api/checkout/sessions
 */
async function sendConfirmationEmail(checkoutSession) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    checkoutSession.payment_intent
  );

  const filePath = checkoutSession.metadata.file;

  // Get information about the payment
  const successfulCharge = paymentIntent.charges.data.filter(charge => {
    return charge.status === "succeeded";
  });

  const billingDetails = successfulCharge.billing_details || {};

  if (!billingDetails.email) {
    console.log("Did not collect customer email address");
    return;
  }

  // Format email
  const mailOptions = {
    from: `American Sock Market - ${GMAIL_EMAIL}`,
    to: billingDetails.email,
    subject: "Your sock pattern from American Sock Market",
    text: `Hey ${billingDetails.name || ""}! Thanks for purchasing.`,
    attachments: [
      {
        filename: "sock-pattern.pdf",
        path: filePath,
        contentType: "application/pdf"
      }
    ]
  };

  return mailTransport.sendMail(mailOptions);
}

// Endpoint defintion
exports.confirm = async (req, res) => {
  let event;

  try {
    // Check headers for signature to make sure it's from Stripe
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.rawBody.toString(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("err", err);
    console.log(`⚠️  Webhook signature verification failed.`);
    return res.sendStatus(400);
  }
  // Extract the object from the event.
  const data = event.data;
  const eventType = event.type;

  switch (eventType) {
    case "checkout.session.completed":
      // The payment is complete! Fulfill the order
      sendConfirmationEmail(data.object);
      return res.sendStatus(200);
    case "charge.dispute.created":
    // Oh no! A customer disputed the payment with their bank
    // Read up on how to handle disputes and fraud with the help of Stripe
    // https://stripe.com/docs/disputes
    default:
      return res.sendStatus(200);
  }
};
