// import { fetchFromAPI } from "./helpers";
var t = window.TrelloPowerUp.iframe({
  appKey: "0bbc9033603e68ca1d133bb85fe9504e",
  appName: "Expense Trackello"
});

const id = t.arg("id");
const products = t.arg("products");

let user = { email: "" };
var price = {
  unit_amount: products[0].price.unit_amount,
  currency: products[0].price.currency,
  id: products[0].price.id
};
var pro = {
  productId: products[0].id
};
var orderData = {
  items: [{ id: price.id }],
  currency: "usd",
  amount: price.unit_amount
};

const handleChange = event => {
  event.preventDefault();

  let key = event.target.id;
  let value = event.target.value;
  user[key] = value;
};

var stripe = Stripe('pk_test_51IEFCDBfYBGKl8DNhO5SuflTxgVYBWnsUcT1uklndd6fLRzroGOrHPrMQOKPyUNEbMHnev3s1J8P7yIb3ewYimjH00UIBvB79R');

// Create an instance of Elements
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: "#32325d",
    lineHeight: "18px",
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#aab7c4"
    }
  },
  invalid: {
    color: "#fa755a",
    iconColor: "#fa755a"
  }
};

// Create an instance of the card Element
var card = elements.create("card", { style: style });

// Add an instance of the card Element into the `card-element` <div>
card.mount("#card-element");

const changeFunc = () => {
  var selectBox = document.getElementById("plans");
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;
  const result = products.find(p => p.id === selectedValue);
  price = result.price;
  pro = { productId: result.id };
  document.getElementById("planSpan").innerText = `${price.currency.toUpperCase()} ${price.unit_amount /
    100}`
  
};

var plan = document.querySelector("#plan");
plan.innerHTML = `<div>
<span>Select Plan</span>
<select name="plan" id="plans" onchange="changeFunc()">
${products.map(
  product => `<option value=${product.id}>${product.name}</option>`
)}
</select>
<span style="border-radius:10px;margin-left:10px;" id="planSpan">${price.currency.toUpperCase()} ${price.unit_amount /
  100}</span>
</div>`;

var form = document.getElementById("payment-form");
form.addEventListener("submit", async function(event) {
  event.preventDefault();
  document.querySelector("button").disabled = true;
  document.querySelector("#spinner").classList.remove("hidden");
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: "card",
    card
  });
  if (error) {
    alert(error.message);
    t.closePopup();
    return t.notifyParent("done");
    return;
  }
  const subscription = await fetch("/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: id,
      email: user.email,
      plan: price.id,
      payment_method: paymentMethod.id
    })
  });

  const ress = await subscription.json();
  const { latest_invoice } = ress;

  t.alert({
    message: "Successfully subscribed to Accounting Powerup"
  });
  t.render(function() {});
  t.closePopup();
  return t.notifyParent("done");
});

// 
//