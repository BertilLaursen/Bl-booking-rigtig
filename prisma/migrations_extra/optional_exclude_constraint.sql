-- VALGFRIT, men anbefalet i produktion for maksimal robusthed:
-- En PostgreSQL EXCLUDE-constraint garanterer på database-niveau, at to
-- CONFIRMED bookinger på samme maskine aldrig kan overlappe — selv i sjældne
-- race conditions ud over det, som transaktionen i lib/booking.ts allerede håndterer.
--
-- Kør denne SQL manuelt mod din database, efter "npx prisma migrate dev":

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT no_overlapping_confirmed_bookings
  EXCLUDE USING gist (
    "machineId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  )
  WHERE (status = 'CONFIRMED');
