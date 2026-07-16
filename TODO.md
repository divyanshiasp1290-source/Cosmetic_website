# TODO
- [ ] Inspect booking form UI and API response handling.
- [x] Update `api/booking.ts`:
  - [x] Fix Nodemailer `secure` option handling (port-derived / env-driven).
  - [x] Return underlying error details in JSON response (for debugging).
  - [ ] Add clearer server-side logging for SMTP and CalDAV steps.

- [ ] (Optional) Update `src/routes/booking.tsx` to display `response.error` more clearly.
- [ ] Re-test booking flow: ensure API returns 200 and calendar event is created.

