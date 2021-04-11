var t = TrelloPowerUp.iframe();
const id = t.arg("id");
const products = t.arg("products");
const subscription = t.arg("subscription");
var app = document.querySelector("#expireIn");
var cancelBtn = document.querySelector("#cancelBtn");
var msgContainer = document.querySelector("#msgContainer");

cancelBtn.innerHTML = `<button class="mod-danger" ${subscription.cancel_at_period_end ? "disabled" : ""
  } onclick="handleCancelSubscription(event)">${subscription.cancel_at_period_end
    ? "Subscription cancelled"
    : "Cancel Subscription"
  }</button>`;

app.innerHTML = `<div>Subscription expires on ${new Date(
  subscription.current_period_end * 1000
)
  .toLocaleDateString("en-US")
  .split(/:| /)}</div>`;

// msgContainer.innerHTML = `<span style="margin-top:20px;color:#a4e5ed;">${
//   subscription. cancel_at_period_end
//     ? "Note::You will be able to re-subscribe after the current subscription is expired"
//     : ""
// }</span>`;
const handleCancelSubscription = async event => {
  cancelBtn.innerHTML = `<button class="mod-danger" disabled>Subscription cancelled</button>`;

  if (subscription.cancel_at_period_end) return;


  await fetch("/subscriptions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: id
    })
  });
};
