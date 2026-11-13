/*
  Already Made site settings. Edit the values in quotes, save, and publish.
  Leave a value as "" to switch that feature off.

  CONTACT_EMAIL         Where requests go when there is no form service.
  BUY_*                 Payment links. Empty means the button reads
                        "Request this" and opens the request page instead.
                        BUY_AD_PACK         $149 one pack
                        BUY_AD_PACK_MONTHLY $129 a month
                        BUY_AD_PACK_WEEKLY  $449 a month
                        BUY_BOOTH_KIT       $199 on its own
                        BUY_BOOTH_ADDON     $99 added to an Ad Pack
                        BUY_RESKIN          $79 next show
                        BUY_SUNDAY_PACK     $79 a month (or $790 a year),
                                            first four Sundays free
  studio_town           Optional. The town and state, for example "Town, PA".
                        Shown in the footer after the legal name.
  postal_address        Optional. A mailing address, shown in the footer
                        after the town. Empty shows nothing extra.
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
  BUY_BOOTH_ADDON: "",
  BUY_RESKIN: "",
  BUY_SUNDAY_PACK: "",

  studio_town: "",
  postal_address: "",

  REQUEST_FORM_ACTION: "",
  REQUEST_FORM_FIELDS: {
    website: "",
    email: "",
    product: "",
    plan: "",
    show_name: "",
    show_dates: "",
    booth_number: "",
    sermon_link: "",
    product_link: "",
    notes: ""
  }
};
