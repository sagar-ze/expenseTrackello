const _ = require("lodash");
const { User } = require("./userModel");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET);
const getOrCreateCustomer = async (userId, email, params) => {
  let user = await User.findOne({ trelloId: userId });
  if (!user) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId }
    });
    user = new User({ trelloId: userId, customerId: customer.id });
    await user.save();
    return customer;
  } else {
    return await stripe.customers.retrieve(user.customerId);
  }
};

const createSubscription = async (userId, email, plan, payment_method) => {
  const customer = await getOrCreateCustomer(userId, email);
  // attach payment method to customer
  await stripe.paymentMethods.attach(payment_method, {
    customer: customer.id
  });
  //set it as the default payment method
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: payment_method }
  });
  //crate subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: plan }],
    expand: ["latest_invoice.payment_intent"]
  });
  const user = await User.findOne({ trelloId: userId });
  await User.findByIdAndUpdate(
    user.id,
    { subscriptionId: subscription.id },
    { new: true }
  );
  //Invoice
  const invoice = subscription.latest_invoice;
  const payment_intent = invoice.payment_intent;
  if (payment_intent.status === "succeeded") {
    console.log("Success");
    await User.findByIdAndUpdate(
      user.id,
      { payment_intent: payment_intent.id },
      { $new: true }
    );
  }

  return subscription;
};

const cancelSubscription = async userId => {
  const user = await User.findOne({ trelloId: userId });
  //cancel at the end of period
  const subscription = await stripe.subscriptions.update(user.subscriptionId, {
    cancel_at_period_end: true
  });
  return subscription;
};

exports.createSubscription = createSubscription;
exports.cancelSubscription = cancelSubscription;
