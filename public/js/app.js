var t = window.TrelloPowerUp.iframe();

let checked = [];
let selected = ["debit", "credit"];
let filtered = [];
// let cost = 0;

let exclude = false;
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ",";
  lineDelimiter = args.lineDelimiter || "\n";

  // keys = Object.keys(data[0]);
  keys = ["transactionType", "name", "amount"];
  result = "";
  result += ["Type", "Description", "Amount"].join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function (item) {
    ctr = 0;
    keys.forEach(function (key) {
      if (ctr > 0) result += columnDelimiter;

      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

const downloadCSV = async function (event) {
  event.preventDefault();
  const cardName = await t.card("name").get("name");
  if (selected.length === 0) return;
  t.getAll("card", "shared").then(d => {
    let data = Object.values(d?.card?.shared);
    data = data.filter(d => selected.includes(d.transactionType));
    var filename, link;
    var csv = convertArrayOfObjectsToCSV({ data });
    if (csv == null) return;
    filename = `${cardName.replace(/\s/g, "")}.csv`;
    if (!csv.match(/^data:text\/csv/i)) {
      csv = "data:text/csv;charset=utf-8," + csv;
    }
    data = encodeURI(csv);
    link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

const handleEdit = (id, name, amount, transactionType) => {
  t.modal({
    url: "modal.html",
    fullsize: false,
    args: { id, name, amount, transactionType },
    accentColor: "#FFFFFF", // Optional color for the modal header
    height: 200,
    resizable: true,
    fullscreen: false // Whether the modal should stretch to take up the whole screen
  });
};

var app = document.querySelector("#app");
var header = document.querySelector("#header");
var checkbox = document.querySelector("#checkbox");
var uniqueElement = document.querySelector("#unique");
var selectField = document.querySelector("#selectField");

// const total = document.querySelector("#total");

const handleCheck = async (id, name, amount, transactionType) => {
  const info = { id, name, amount, transactionType };
  const index = checked.indexOf(id);
  if (index === -1) {
    checked.push(id);
  } else {
    checked.splice(index, 1);
  }
  if (exclude) {
    const res = await func(true);
    let currency = document.getElementById("selectField").value;
    currency = currency ? currency : "$";
    document.getElementById("unique").innerText = currency + " " + res;
  }
};

const handleSelect = data => {
  const index = selected.indexOf(data);
  if (index === -1) {
    selected.push(data);
    document.getElementById(data).className =
      data === "credit" ? "mod-primary" : "mod-danger";
  } else {
    selected.splice(index, 1);
    document.getElementById(data).className = "";
  }
};

const handleAdd = event => {
  event.preventDefault();
  t.modal({
    url: "modal.html",
    fullsize: false,
    accentColor: "#FFFFFF", // Optional color for the modal header
    height: 200,
    resizable: true,
    fullscreen: false // Whether the modal should stretch to take up the whole screen
    // callback: () =>  // optional function called if user closes modal (via `X` or escape)
  });
};
const handleFilter = data => {
  t.getAll("card", "shared").then(async function (da) {
    const dataToBeMapped = Object.values(da?.card?.shared);
    const result = dataToBeMapped.filter(z => z.transactionType === data);
    const index = filtered.indexOf(data);
    if (index === -1) {
      const arr = [...result.map(r => r.id), ...checked];
      checked = [...new Set(arr)];
      filtered.push(data);
      checked.map(f => (document.getElementById(f).checked = true));
      document.getElementById(data + "s").className =
        data === "credit" ? "mod-primary" : "mod-danger";
    } else {
      filtered.splice(index, 1);
      checked = checked.filter(c => !result.map(r => r.id).includes(c));
      result.map(f => (document.getElementById(f.id).checked = false));
      document.getElementById(data + "s").className = "";
    }
    if (exclude) {
      const res = await func(true);
      let currency = document.getElementById("selectField").value || "$";
      currency = currency ? currency : "$";
      document.getElementById("unique").innerText = currency + " " + res;
    }
  });
};
const changeFunc = () => {
  var selectBox = document.getElementById("selectField");
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;
  t.set("board", "shared", "currency", selectedValue);
};

const deleteData = event => {
  if (checked.length === 0) return;
  swal("Are you sure you want to delete?", {
    dangerMode: true,
    buttons: true,
  }).then(willDelete => {
    if (willDelete) {
      swal({
        icon: "success",
        buttons: false,
        timer: 1500
      });
      t.remove("card", "shared", checked);
    } else {
    }
  });
};
const func = f => {
  return t.getAll("card", "shared").then(function (data) {
    const dataToBeMapped = Object.values(data?.card?.shared);
    if (f)
      return dataToBeMapped
        .filter(a => !checked.includes(a.id))
        .reduce(
          (acc, red) =>
            red.transactionType === "credit"
              ? acc + parseFloat(parseFloat(red.amount).toFixed(2))
              : acc - parseFloat(parseFloat(red.amount).toFixed(2)),
          0
        )
        .toLocaleString();
    else
      return dataToBeMapped
        .reduce(
          (acc, red) =>
            red.transactionType === "credit"
              ? acc + parseFloat(parseFloat(red.amount).toFixed(2))
              : acc - parseFloat(parseFloat(red.amount).toFixed(2)),
          0
        )
        .toLocaleString();
  });
};
const handleExclude = async event => {
  let currency = await t.get("board", "shared", "currency");
  currency = currency ? currency : "$";
  document.getElementById("listTotal").checked = !exclude;
  const cost = await func(!exclude);
  exclude = !exclude;
  document.getElementById("unique").innerText = currency + " " + cost;
};
let tot;
t.render(async function () {
  let currency = await t.get("board", "shared", "currency");
  currency = currency ? currency : "$";
  const v = document.getElementById("selectField");
  if (v?.value) v.value = currency;

  return t
    .getAll("card", "shared")
    .then(function (data) {
      const dataToBeMapped = data?.card?.shared
        ? Object.values(data?.card?.shared)
        : [];
      tot = dataToBeMapped;
      const t = dataToBeMapped
        .reduce(
          (acc, red) =>
            red.transactionType === "credit"
              ? acc + parseFloat(parseFloat(red.amount).toFixed(2))
              : acc - parseFloat(parseFloat(red.amount).toFixed(2)),
          0
        )
        .toLocaleString();
      if (!app) return;
      if (app || Object.keys(app).length !== 0) {
        app.innerHTML = dataToBeMapped
          .map(info =>
            checked.includes(info.id)
              ? checkedList(info, currency)
              : list(info, currency)
          )
          .join("");
      }
      document.getElementById("unique").innerText = currency + " " + t;
      header.innerHTML = exclude
        ? headersTotal(
          dataToBeMapped
            .filter(a => !checked.includes(a.id))
            .reduce(
              (acc, red) =>
                red.transactionType === "credit"
                  ? acc + parseFloat(parseFloat(red.amount).toFixed(2))
                  : acc - parseFloat(parseFloat(red.amount).toFixed(2)),
              0
            )
        )
        : headers(t);
    })
    .then(function () {
      t.sizeTo(tot.length * 50 + 160).done();
    });
});

function list(wizard, curr) {
  return `
<div style="margin-top:5px;">
<div style="display: flex; flex-direction: column;  ">
           <div style="display: flex; align-items: center; text-align:left; padding-top:5px; margin-left:3px;" >
          <input type="checkbox" class="checkbox" style="cursor: pointer;" onclick="handleCheck('${wizard.id
    }','${wizard.name}','${wizard.amount}','${wizard.transactionType
    }')" id=${wizard.id.toString()} />
           <div style=" font-size:14px; margin-top:-12px; margin-left:5px; white-space: nowrap;text-overflow: ellipsis; ">
           ${wizard.name}
           </div>
           <img src="https://www.pngfind.com/pngs/m/273-2730034_white-post-it-png-edit-symbol-transparent-png.png" height="15px" alt="" style=" margin-left: auto;margin-right:5px; cursor: pointer; " 
onclick="handleEdit('${wizard.id}','${wizard.name}','${wizard.amount}','${wizard.transactionType
    }')"/>
           </div>
           </div>
<div style="margin-top:-8px;">
        <button class=${wizard.transactionType === "credit" ? "mod-primary" : "mod-danger"
    } style="padding:0px 2px 0px 2px; margin-top:0px;  margin-left:25px;margin-top:-15px; text-align:left; text-overflow:hidden; white-space: nowrap; ">
           ${curr} ${parseFloat(
      parseFloat(wizard.amount).toFixed(2)
    ).toLocaleString()}
            </button> 
</div>
</div>
`;
}

function checkedList(wizard, curr) {
  return `
<div style="margin-top:5px;">
<div style="display: flex; flex-direction: column;  ">
           <div style="display: flex; align-items: center; text-align:left; padding-top:5px; margin-left:3px;" >
          <input type="checkbox" class="checkbox" style="cursor: pointer;" onclick="handleCheck('${wizard.id
    }','${wizard.name}','${wizard.amount}','${wizard.transactionType
    }')" id=${wizard.id.toString()} checked/>
           <div style=" font-size:14px; margin-top:-12px; margin-left:5px; white-space: nowrap;text-overflow: ellipsis; ">
           ${wizard.name}
           </div>
           <img src="https://www.pngfind.com/pngs/m/273-2730034_white-post-it-png-edit-symbol-transparent-png.png" height="15px" alt="" style=" margin-left: auto;margin-right:5px; cursor: pointer; " 
onclick="handleEdit('${wizard.id}','${wizard.name}','${wizard.amount}','${wizard.transactionType
    }')"/>
           </div>
   
           </div>
<div style="margin-top:-8px;">
        <button class=${wizard.transactionType === "credit" ? "mod-primary" : "mod-danger"
    } style="padding:0px 2px 0px 2px; margin-top:0px;  margin-left:25px;margin-top:-15px; text-align:left; text-overflow:hidden; white-space: nowrap; ">
            ${curr} ${parseFloat(
      parseFloat(wizard.amount).toFixed(2)
    ).toLocaleString()}
            </button> 
</div>
</div>
`;
}

const headers = cost => `<div>  <input type="checkbox" id="listTotal"class="checkbox" onclick="handleExclude(event)" style="cursor:pointer;margin-left:2px;font-size:13px;margin-top:10px;"/> 
    <span style="margin-top:15px;font-size:13px;">Exclude from card total</span>  

 <button id="credits" style="margin-right:0px;border:1px solid #5AAC44; border-radius:0px;padding:0px 4px;margin-left:auto;" onclick="handleFilter('credit')" >Credit </button>
<button  id="debits" onclick="handleFilter('debit')"  style="margin-left:0px;border:1px solid #CF513D; border-radius:0px;padding:0px 4px; ">Debit</button>
</div>`;

const headersTotal = cost => `<div>  <input type="checkbox" id="listTotal"class="checkbox" checked onclick="handleExclude(event)" style="cursor:pointer;margin-left:2px;font-size:13px;margin-top:10px;"/> 
    <span style="margin-top:15px;font-size:13px;">Exclude from card total</span>  

 <button id="credits" style="margin-right:0px; border-radius:0px;border:1px solid #5AAC44; padding:0px 4px;margin-left:auto;" onclick="handleFilter('credit')" >Credit </button>
<button  id="debits" onclick="handleFilter('debit')"  style="margin-left:0px;border:1px solid #CF513D; border-radius:0px;padding:0px 4px; ">Debit</button>
</div>`;
