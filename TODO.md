# TODO

- [x] Locate Google Calendar implementation (api/booking.ts).
- [ ] Refactor Google Calendar logic to simplify timezone handling.
  - [ ] Remove parseBookingDateTime().
  - [ ] Use process.env.GOOGLE_TIMEZONE || "America/Vancouver".
  - [ ] Do not manually calculate timezone offsets; let Google Calendar handle it.
  - [ ] Remove guestsCanInvite and attendees: [].
  - [ ] Keep all other logic unchanged.
