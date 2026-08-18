# FateDrop beta lead capture

The collector, retailer/vendor and event-organiser forms submit to `POST /api/leads`. The endpoint keeps the original required-field, email, URL, enum, origin, payload-size and honeypot validation.

## Local development

With `FATEDROP_LEAD_STORE=file`, successful submissions are written to `data/beta-leads.ndjson`. The file is deliberately excluded from Git because it may contain personal information.

Duplicate submissions are rejected using the same `role + email` rule used by the hosted database.

## Hosted deployment

With `FATEDROP_LEAD_STORE=postgres`, the endpoint uses `DATABASE_URL` and expects the schema in `database/postgres.sql`.

The public application exposes no lead-reading or export endpoint. Database access and exports must remain restricted to authorised operators.

## Privacy and operations

The table records only the information deliberately entered into the form, required contact consent, optional marketing consent, source and creation time. The application does not deliberately record IP addresses, user-agent strings or browsing history.

Before significant acquisition activity:

- add the final data-controller identity and a monitored privacy contact;
- agree and apply a retention schedule;
- restrict database access;
- complete a legal review of the privacy notice and consent wording;
- define who responds to each enquiry and within what timeframe.
