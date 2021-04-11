/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
let user = {};

const handleChange = event => {
  event.preventDefault();

  let key = event.target.id;
  let value = event.target.value;
  if (key === "debit" || key === "credit") user["transactionType"] = value;
  else if (key === "name") user[key] = value;
  else user[key] = value;
};

const handleSubmit = event => {
  event.preventDefault();
  try {
    if (user.id) {
      user.name = user.name.replace(/<[^>]*>?/gm, "");
      if (!user.name) {
        user = {};
        return t.closeModal();
      }
      t.set("card", "shared", user.id, user).then(res => {
        document.getElementById("form").reset();
        user = {};
        t.closeModal();
      });
    } else {
      let r = Math.random()
        .toString(36)
        .substring(7);
      user.name = user.name.replace(/<[^>]*>?/gm, "");
      if (!user.name) {
        user = {};
        return t.closeModal();
      }
      t.set("card", "shared", `${r}`, {
        ...user,
        transactionType: user?.transactionType ?? "credit",
        id: r
      });
      document.getElementById("form").reset();
      user = {};
    }
  } catch (ex) {
    // console.log("exception is", ex);
  }
};

const closeDialogBox = event => {
  event.preventDefault();
  t.closeModal();
  user = {};
};

const id = t.arg("id");
const amount = t.arg("amount");
const name = t.arg("name");
const transactionType = t.arg("transactionType");
if (id) {
  user = { id, amount, name, transactionType };
  document.getElementById("name").value = name;
  document.getElementById("amount").value = amount;
  document.getElementById(`${transactionType}`).checked = true;
}
