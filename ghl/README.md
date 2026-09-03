# Putting this page into GoHighLevel

Everything in this folder is generated. Do not edit these files by hand. Edit the
real site in the repo root, then run `python3 scripts/build-ghl.py` to rebuild.

## Read this first

GHL is a drag-and-drop builder. Pasting a fully custom-coded page into it means
**you will not be able to edit this page in the GHL editor afterwards.** Changing a
headline becomes a code edit and a re-paste, not a click. That is the trade you are
making for a design GHL's builder cannot produce on its own.

If that matters to you, there is a middle path: host these static files on Netlify
or Cloudflare Pages for free, point selltohermes.com there, and use GHL purely for
the CRM by sending the form to a GHL webhook. You keep the design and GHL still gets
every lead, tagged and in workflows. Same result, one fewer thing to fight.

Assuming you want it inside GHL, here is the order.

## 1. Create the funnel and its steps

Create a Funnel (or Website) with four steps:

| Step path | Purpose |
|---|---|
| `/` | The main landing page |
| `/thank-you` | Where the form lands. Also your ad conversion page |
| `/privacy-policy` | Linked from the footer |
| `/terms-and-conditions` | Linked from the footer |

The paths must match exactly, because the links and the form redirect point at them.

## 2. Paste the head code

**Settings > Head Tracking Code**, paste all of `1-head-code.html`.

This carries the fonts, the full stylesheet, the LocalBusiness and FAQ structured
data, and a reset that cancels GHL's own section padding. It is shared by every step,
so you only do this once.

## 3. Paste each page body

On each step, delete the default content, add one **Custom Code / HTML** element, and
set its section to full width with zero padding. Then paste:

| Step | File |
|---|---|
| `/` | `2-page-body.html` |
| `/thank-you` | `5-thank-you-body.html` |
| `/privacy-policy` | `6-privacy-body.html` |
| `/terms-and-conditions` | `7-terms-body.html` |

The logos are embedded directly in the markup as data URIs, so there is nothing to
upload to the media library first.

## 4. Paste the footer code

**Settings > Footer Tracking Code**, paste all of `3-footer-code.html`. This runs the
multi-step form, the FAQ accordion, the mobile menu and the scroll animations.

## 5. Wire the form to GHL, or it collects nothing

This is the step people skip. A custom HTML form does **not** create GHL contacts on
its own. Leads will vanish.

1. **Automation > Workflows > Create Workflow**
2. Trigger: **Inbound Webhook**. Copy the webhook URL it gives you.
3. In `3-footer-code.html`, near the top, set:
   `var FORM_ENDPOINT = 'https://paste-your-webhook-url-here';`
4. Re-paste the footer code into GHL.
5. Submit the form once on the live page so GHL captures a sample payload.
6. Back in the workflow, add **Create/Update Contact** and map the fields.

The payload uses these names:

```
name  phone  email  address  propertyType  condition  timeline
utm_source  utm_medium  utm_campaign  utm_term  utm_content  gclid  fbclid
page  referrer  submittedAt
```

The UTM and click-id fields are the reason to bother: they tell you which ad produced
each seller, straight on the contact record.

**Or, if you would rather use a native GHL form:** delete everything from
`<div class="form-card reveal">` to its closing `</div>` in `2-page-body.html`, and
drop a GHL form element in that column instead. You lose the styling and the
three-step flow, and you gain native GHL editing.

## 6. SEO and favicon

Open `4-seo-fields.txt` and copy each value into **Settings > SEO Meta Data**. These
are form fields in GHL, not code. Upload `assets/img/favicon.png` as the favicon in
the same panel.

You still have no social share image. Until you make a 1200x630 one, links shared by
text or on Facebook will show no picture.

## 7. Check before you launch

- Submit the form and confirm a contact appears in GHL.
- Open the page on a real phone. The sticky call bar should sit at the bottom.
- Click every footer link and confirm the four step paths resolve.
- Confirm GHL's own header or nav is switched off for these steps. The page carries
  its own, and two stacked headers looks broken.
