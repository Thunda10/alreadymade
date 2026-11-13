/*
  Already Made site settings. Edit the values in quotes, save, and publish.
  Leave a value as "" to switch that feature off.

  CONTACT_EMAIL         Where requests go when there is no form service.
  BUY_*                 Payment links. Empty means the button reads
                        "Request this" and opens the request page instead.
  REQUEST_FORM_ACTION   A form endpoint that accepts a normal POST
                        (for example a Google Form "formResponse" URL).
  REQUEST_FORM_FIELDS   Our field names mapped to that form's field ids.
                        Fields left out are sent under their own names.
*/
window.SITE_CONFIG = {
  CONTACT_EMAIL: "",

  BUY_AD_PACK: "",
  BUY_AD_PACK_MONTHLY: "",
  BUY_AD_PACK_WEEKLY: "",
  BUY_BOOTH_KIT: "",
  BUY_RESKIN: "",

  REQUEST_FORM_ACTION: "",
  REQUEST_FORM_FIELDS: {
    website: "",
    email: "",
    product: "",
    plan: "",
    show_name: "",
    show_dates: "",
    booth_number: "",
    notes: ""
  }
};
