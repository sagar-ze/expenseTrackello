const createPaymentIntent=async (stripe, amount)=> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd"
  });
  return paymentIntent;
}
exports.createPaymentIntent = createPaymentIntent;
