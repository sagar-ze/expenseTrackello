// server.js
// where your node app starts

const compression = require("compression");
const cors = require("cors");
const express = require("express");
const Stripe = require("stripe");
const _ = require("lodash");
const { createPaymentIntent } = require("./payments");
const { handleStripeWebhook } = require("./webhooks");
const { User } = require("./userModel");
const { createSubscription, cancelSubscription } = require("./user");
const app = express();

require("./db")();
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(compression());
app.use(cors({ origin: "https://trello.com" }));
app.use(express.static("public"));
app.use(
  express.json({
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);

app.get("/products", async (req, res) => {
  let [products, prices] = await Promise.all([
    stripe.products.list(),
    stripe.prices.list()
  ]);

  if (products.data.length === 0) return res.status(200).send([]);

  products = products.data
    .filter(product => product.active === true)
    .map(product => ({
      price: _.pick(prices.data.find(p => p.product === product.id), [
        "id",
        "unit_amount",
        "currency"
      ]),
      id: product.id,
      name: product.name,
      description: product.description
    }));
  res.status(200).send(products);
});

app.post("/payments", async (req, res) => {
  const paymentIntent = await createPaymentIntent(stripe, req.body.amount);
  res.status(200).send(paymentIntent);
});

const PORT = process.env.PORT ?? 4242;
const listener = app.listen(PORT, function() {
  console.log(
    "Trello Power-Up Server listening on port " + listener.address().port
  );
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post("/subscriptions", async (req, res) => {
  const { userId, email, plan, payment_method } = req.body;
  const subscription = await createSubscription(
    userId,
    email,
    plan,
    payment_method
  );
  res.send(subscription);
});

app.put("/subscriptions", async (req, res) => {
  const { userId } = req.body;
  console.log('Cancel subscription endpoint ',userId)
  res.send(await cancelSubscription(userId));
});

pp.post("/user-info", async (req, res) => {
  const user = await User.findOne({ trelloId: req.body.userId });
  // console.log("User is", user);
  if (!user) return res.status(200).send(null);

  const charges = await stripe.charges.list({
    payment_intent: user.payment_intent
  });

  if( charges?.data[0]?.refunded) return res.status(200).send(null);

  const subscriptionInfo = await stripe.subscriptions.retrieve(
    user.subscriptionId
  );
  res.status(200).send(subscriptionInfo);
});
app.post("/webhook", async (req, res) => handleStripeWebhook);
