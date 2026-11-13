/* Already Made: buy buttons, contact lines and the request form. */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  function setting(key) {
    var value = cfg[key];
    return typeof value === "string" ? value.trim() : "";
  }

  /* Buy buttons. Markup ships as "Request this" pointing at the request page;
     a payment link in config.js turns the button into a real purchase. */
  document.querySelectorAll("[data-buy]").forEach(function (link) {
    var url = setting(link.getAttribute("data-buy"));
    if (!url) return;
    link.href = url;
    link.textContent = link.getAttribute("data-buy-label") || "Buy now";
    link.rel = "noopener";
  });

  /* Contact email, shown only when one is set. */
  var email = setting("CONTACT_EMAIL");
  document.querySelectorAll("[data-contact]").forEach(function (wrapper) {
    if (!email) return;
    wrapper.querySelectorAll("[data-contact-email]").forEach(function (a) {
      a.href = "mailto:" + email;
      a.textContent = email;
    });
    wrapper.hidden = false;
  });

  /* Request form */
  var form = document.getElementById("request-form");
  if (!form) return;

  var PRODUCTS = {
    "ad-pack": "Ad Pack", "sunday-pack": "Sunday Pack", "booth-kit": "Booth Kit",
    "launch-pack": "Launch Pack", "review-pack": "Review Pack", "catalog-pack": "Catalog Pack",
    "market-pack": "Market Pack", "podcast-pack": "Podcast Pack", "talk-pack": "Talk Pack"
  };
  var PLANS = {
    "one": "One pack",
    "monthly": "Monthly",
    "weekly": "Weekly",
    "reskin": "Next show re-skin",
    "addon": "Added to an Ad Pack",
    "yearly": "Yearly"
  };

  var status = document.getElementById("form-status");
  var submit = form.querySelector("[type=submit]");
  // Which extra questions each pack needs. Packs not listed need none.
  var FIELDSET_FOR = {
    "booth-kit": "booth-fields", "market-pack": "booth-fields",
    "sunday-pack": "sunday-fields", "podcast-pack": "sunday-fields", "talk-pack": "sunday-fields",
    "launch-pack": "launch-fields"
  };
  var extraFields = ["booth-fields", "sunday-fields", "launch-fields"].map(function (id) {
    return document.getElementById(id);
  });
  var planInput = form.elements.plan;
  var planNote = document.getElementById("plan-note");

  var params = new URLSearchParams(window.location.search);
  var preselect = params.get("product");
  if (PRODUCTS[preselect]) {
    form.querySelector('input[name=product][value="' + preselect + '"]').checked = true;
  }
  var plan = params.get("plan");
  if (PLANS[plan]) {
    planInput.value = plan;
    planNote.textContent = "Plan: " + PLANS[plan];
    planNote.hidden = false;
  }

  function selectedProduct() {
    var checked = form.querySelector("input[name=product]:checked");
    return checked ? checked.value : "";
  }

  // Show only the extra fields that belong to the chosen product.
  function syncFields() {
    var wanted = FIELDSET_FOR[selectedProduct()] || "";
    extraFields.forEach(function (fieldset) {
      var on = fieldset.id === wanted;
      fieldset.hidden = !on;
      fieldset.disabled = !on;
    });
  }
  form.addEventListener("change", function (event) {
    if (event.target.name !== "product") return;
    syncFields();
    // A plan only belongs to the product it was picked for.
    planInput.value = "";
    planNote.hidden = true;
  });
  syncFields();

  var action = setting("REQUEST_FORM_ACTION");
  var mode = action ? "post" : email ? "mailto" : "closed";
  form.setAttribute("data-mode", mode);

  function showStatus(html) {
    status.innerHTML = html;
    status.hidden = false;
  }

  if (mode === "closed") {
    submit.disabled = true;
    showStatus("Requests open shortly.");
  }

  function collect() {
    var data = {};
    ["website", "email", "product", "plan", "show_name", "show_dates", "booth_number", "sermon_link", "product_link", "notes"].forEach(function (name) {
      var field = form.elements[name];
      if (!field || field.disabled) return;
      var value = name === "product" ? selectedProduct() : field.value.trim();
      if (value) data[name] = value;
    });
    return data;
  }

  function showThanks() {
    var panel = document.getElementById("form-thanks");
    form.hidden = true;
    panel.hidden = false;
    panel.focus();
  }

  function postToIframe(data) {
    var map = cfg.REQUEST_FORM_FIELDS || {};
    var frame = document.getElementById("request-frame");
    var out = document.createElement("form");
    out.method = "POST";
    out.action = action;
    out.target = frame.name;
    out.hidden = true;
    Object.keys(data).forEach(function (name) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = (map[name] || "").trim() || name;
      input.value = name === "product" ? PRODUCTS[data[name]] :
                    name === "plan" ? PLANS[data[name]] : data[name];
      out.appendChild(input);
    });
    document.body.appendChild(out);
    out.submit();
    out.remove();
  }

  function mailtoLink(data) {
    var product = PRODUCTS[data.product] || "a pack";
    var lines = [
      "Website: " + data.website,
      "Work email: " + data.email,
      "Which one: " + product + (data.plan ? " (" + PLANS[data.plan] + ")" : "")
    ];
    if (data.show_name) lines.push("Show or market: " + data.show_name);
    if (data.show_dates) lines.push("Dates: " + data.show_dates);
    if (data.booth_number) lines.push("Booth number: " + data.booth_number);
    if (data.sermon_link) lines.push("Feed, sermon page or recording: " + data.sermon_link);
    if (data.product_link) lines.push("Product page: " + data.product_link);
    if (data.notes) lines.push("", "Notes:", data.notes);
    var subject = "Request: " + product + " for " + data.website;
    return "mailto:" + email + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (mode === "closed") return;

    // Filled only by bots. Pretend it worked and send nothing.
    if (form.elements.company_fax.value) {
      showThanks();
      return;
    }

    var data = collect();

    if (mode === "post") {
      postToIframe(data);
      showThanks();
      return;
    }

    var href = mailtoLink(data);
    window.location.href = href;
    showStatus(
      'Your email app should open with the request ready to send. If it did not, ' +
      '<a href="' + href.replace(/"/g, "&quot;") + '">open it here</a> or write to ' +
      '<a href="mailto:' + email + '">' + email + "</a>."
    );
  });
})();
