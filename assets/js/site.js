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

  /* Studio town and postal address after the legal name in the footer,
     shown only when config.js sets them. Read straight from the config so the
     lowercase setting names work as written. */
  [["studio_town", "data-studio-town", " Studio in "], ["postal_address", "data-postal-address", " Mailing address: "]].forEach(function (item) {
    var raw = cfg[item[0]];
    var value = typeof raw === "string" ? raw.trim().replace(/\.$/, "") : "";
    if (!value) return;
    document.querySelectorAll("[" + item[1] + "]").forEach(function (span) {
      span.textContent = item[2] + value + ".";
      span.hidden = false;
    });
  });

  /* Contact email. The page ships an empty, hidden span; the words and the link
     are built here only when an address is set, so no empty link is ever shown. */
  var email = setting("CONTACT_EMAIL");
  document.querySelectorAll("[data-contact]").forEach(function (wrapper) {
    if (!email) return;
    var a = document.createElement("a");
    a.setAttribute("data-contact-email", "");
    a.href = "mailto:" + email;
    a.textContent = email;
    wrapper.textContent = wrapper.getAttribute("data-contact") || "";
    wrapper.appendChild(a);
    wrapper.appendChild(document.createTextNode(wrapper.getAttribute("data-contact-after") || ""));
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
  // The price a plan costs, by product, so the form never shows the one-pack price for a plan.
  var PLAN_PRICES = {
    "ad-pack": { "one": "$149", "monthly": "$129 a month", "weekly": "$449 a month" },
    "booth-kit": { "addon": "$99", "reskin": "$79" },
    "sunday-pack": { "monthly": "$79 a month", "yearly": "$790 a year" }
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
  var planPrice = PRODUCTS[preselect] && PLAN_PRICES[preselect] ? PLAN_PRICES[preselect][plan] : "";
  var priceTag = null, oldPrice = "";
  if (PLANS[plan]) {
    planInput.value = plan;
    planNote.textContent = "Plan: " + PLANS[plan] + (planPrice ? ", " + planPrice : "");
    planNote.hidden = false;
    if (planPrice) {
      priceTag = form.querySelector('input[name=product][value="' + preselect + '"] + span small');
      if (priceTag) {
        oldPrice = priceTag.textContent;
        priceTag.textContent = planPrice;
      }
    }
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
    if (priceTag) {
      priceTag.textContent = oldPrice;
      priceTag = null;
    }
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
    showStatus('Requests open shortly. <a href="samples.html">Until then, see the samples.</a>');
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
