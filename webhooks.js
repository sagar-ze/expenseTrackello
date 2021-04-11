const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET);

const webhooksHandler = {
  "payment_intent.succeeded": async data => {
    //logic
  },
  "payment_intent.payment_failed": async data => {
    //logic
  },
  "customer.subscription.deleted": async data => {
    //business logic
  },
  "customer.subscription.created": async data => {},
  "invoice.payment_succeeded": async data => {},
  "invoice.payment_failed": async data => {
    const customer = await stripe.customer.retrieve(data.customer);
    console.log("Customer metadata", customer.metadata);
  }
};

const handleStripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const event = stripe.webhooks.constructEvent(
    req["rawBody"],
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  try {
    await webhooksHandler[event.type](event.data.object);
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

exports.handleStripeWebhooks = handleStripeWebhooks;
