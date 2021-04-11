/* global TrelloPowerUp */
var Promise = TrelloPowerUp.Promise;
var subscription;

var CREDIT =
  "https://cdn.glitch.com/ba188874-72c2-43a9-b251-29e5f58198e6%2Fcashback.svg?v=1611593618751";
const DEBIT =
  "https://cdn.glitch.com/ba188874-72c2-43a9-b251-29e5f58198e6%2Floss.svg?v=1611593872270";
var GLITCH_ICON =
  "https://cdn.glitch.com/ba188874-72c2-43a9-b251-29e5f58198e6%2Fsymbol.svg?v=1611593618428";
var GRAY_ICON =
  "https://cdn.glitch.com/ba188874-72c2-43a9-b251-29e5f58198e6%2Fsymbol.svg?v=1611593618428";
var WHITE_ICON =
  "https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg";
var LOGO_ICON =
  "https://cdn.glitch.com/ba188874-72c2-43a9-b251-29e5f58198e6%2FQUv1tHE7qr.svg?v=1612285271104";

const getTokenInfo = t => {
  let success = response => JSON.stringify(response, null, 2);
  let error = error => alert(JSON.stringify(error, null, 2));

  let makeRequest = async token => {
    window.Trello.setToken(token);
    try {
      return window.Trello.members.get("me", success, error);
    } catch (err) {
      // console.log(err);
    }
  };
  return t
    .getRestApi()
    .getToken()
    .then(token => {
      if (!token) {
        return;
      } else {
        return makeRequest(token);
      }
    });
};

const getSubscriptionInfo = async userId => {
  const productResponse = await fetch("/user-info", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
  });
  return await productResponse.json();
};
var onBtnClick = function (t, opts) {
  return;
};
var restApiCardButtonCallback = function (t) {
  return t
    .getRestApi()
    .isAuthorized()
    .then(async function (authorized) {
      if (!authorized) {
        return t.popup({
          title: "Expense Trackello",
          url: "../api-client-authorize.html"
        });
      } else {
        const user = await getTokenInfo(t);

        return t.popup({
          title: "Expense Trackello",
          items: [
            {
              text: "Subscription ",
              callback: async function (t) {
                const productResponse = await fetch("/products", {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json"
                  }
                });

                const data = await productResponse.json();

                return t.popup({
                  args: { id: user.id, products: data, subscription },
                  title: "Subscription Plan",
                  url:
                    subscription?.current_period_end * 1000 > Date.now()
                      ? "./unsuscribe.html"
                      : data.length === 0
                        ? "./no-content.html"
                        : "./popup.html",
                  height: 200,
                  callback: async t => {
                    const v = await t.get("board", "shared", "visible");
                    await t.set("board", "shared", "visible", !v ?? true);
                    if (v === true) t.set("board", "shared", "visible", true);
                  }
                });
              }
            },
            {
              text: "Unauthorize",
              callback: function (t) {
                return t
                  .getRestApi()
                  .clearToken()
                  .then(function () {
                    t.alert("You've successfully deauthorized!");
                    t.closePopup();
                  });
              }
            }
          ]
        });
      }
    });
};

var getBadges = async function (t) {
  return t
    .card("name")
    .get("name")
    .then(async function (cardName) {
      const currency = await t.get("board", "shared", "currency");
      const debit = await t.getAll("card", "shared").then(data => {
        if (!data || !data?.card?.shared || Object.values(data).length === 0)
          return 0;
        return Object.values(data?.card?.shared)
          .filter(d => d.transactionType === "debit")
          .reduce((acc, red) => acc + parseFloat(red.amount), 0)
          .toLocaleString();
      });
      const credit = await t.getAll("card", "shared").then(data => {

        if (!data || !data?.card?.shared || Object.values(data).length === 0)
          return 0;
        return Object.values(data?.card?.shared)
          .filter(d => d.transactionType === "credit")
          .reduce((acc, red) => acc + parseFloat(red.amount), 0)
          .toLocaleString();
      });
      if (!debit || !credit) return
      return [
        {
          title: "Debit",
          refresh: 10,
          text: currency ? currency + " " + debit : "$" + " " + debit,
          icon: DEBIT,
          color: "red"
        },
        {
          title: "Credit",
          text: currency ? currency + credit : "$" + " " + credit,
          refresh: 10,
          icon: CREDIT,
          color: "green"
        }
      ];
    });
};

// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize(
  {
    "card-badges": function (t, options) {
      return getBadges(t);
    },
    "card-back-section": async function (t, options) {
      const user = await getTokenInfo(t);
      if (!user) return;

      const productResponse = await fetch("/user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user.id })
      });
      subscription = await productResponse?.json();
      if (!subscription) return;

      if (subscription.current_period_end * 1000 < Date.now()) return;
      const [expense, isVisible = true] = await Promise.all([
        t
          .getAll("card", "shared")
          .then(data =>
            data?.card?.shared ? Object.values(data?.card?.shared) : []
          ),
        t.get("board", "shared", "visible")
      ]);

      return {
        title: "Expense Trackello",
        icon: LOGO_ICON,

        content: isVisible
          ? expense.length > 0
            ? {
              type: "iframe",
              url: t.signUrl("./card-back-section.html"),
              height: expense.length * 50 + 160
            }
            : {
              type: "iframe",
              url: t.signUrl("./no-back-content.html"),
              height: 80
            }
          : { type: "iframe", height: 1, url: t.signUrl("./hidden.html") },
        action: {
          text: isVisible ? "Hide" : "Show",
          callback: t => t.set("board", "shared", "visible", !isVisible ?? true)
        }
      };
    },
    "card-detail-badges": function (t, options) {
      return getBadges(t);
    },
    "card-buttons": function (t, opts) {
      return [
        {
          icon:
            "https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421",
          text: "Expense Trackello",
          callback: restApiCardButtonCallback
        }
      ];
    }
  },

  {
    appKey: '0bbc9033603e68ca1d133bb85fe9504e',
    appName: "Expense Trackello"
  }
);


// 