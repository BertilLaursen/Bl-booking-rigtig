import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export class BookingOverlapError extends Error {
  constructor() {
    super("Maskinen er allerede booket i dette tidsrum.");
    this.name = "BookingOverlapError";
  }
}

/**
 * Opretter en booking og garanterer, at ingen to bekræftede bookinger på samme
 * maskine kan overlappe. Kontrollen sker inde i en database-transaktion, ALDRIG
 * kun i klienten, så race conditions mellem to samtidige bookingforsøg undgås.
 *
 * For ekstra robusthed i produktion anbefales det derudover at tilføje en
 * PostgreSQL EXCLUDE-constraint (kræver btree_gist extension), se README.md.
 */
export async function createBookingWithOverlapCheck(params: {
  machineId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  visibility: "FULL_NAME" | "FIRST_NAME" | "HIDDEN";
}) {
  const { machineId, userId, startTime, endTime, visibility } = params;

  if (startTime >= endTime) {
    throw new Error("Starttidspunkt skal være før sluttidspunkt.");
  }

  return prisma.$transaction(
    async (tx) => {
      const overlapping = await tx.booking.findFirst({
        where: {
          machineId,
          status: BookingStatus.CONFIRMED,
          startTime: { lt: endTime },
          endTime: { gt: startTime }
        }
      });

      if (overlapping) {
        throw new BookingOverlapError();
      }

      return tx.booking.create({
        data: { machineId, userId, startTime, endTime, visibility }
      });
    },
    { isolationLevel: "Serializable" }
  );
}
