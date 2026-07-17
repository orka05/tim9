"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./session";
import { ClientReviewRepository } from "../repositories/ClientReviewRepository";

export type RateClientState = { error?: string; success?: boolean };

/**
 * Trener ocenjuje klijenta (kakav je bio u saradnji), uz opcioni komentar.
 * Jedna ocena po paru (trener, klijent); prosek klijenta se preračunava.
 */
export async function rateClientAction(
  _prev: RateClientState,
  formData: FormData,
): Promise<RateClientState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo trener može oceniti klijenta." };
  }

  const clientId = Number(formData.get("clientId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return { error: "Klijent nije ispravno izabran." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return { error: "Ocena mora biti ceo broj od 1 do 10." };
  }
  if (comment.length > 500) {
    return { error: "Komentar može imati najviše 500 karaktera." };
  }

  const saved = await ClientReviewRepository.rate(
    session.userId,
    clientId,
    rating,
    comment || null,
  );
  if (!saved) {
    return {
      error: "Možeš oceniti samo klijenta sa kojim imaš prihvaćenu saradnju.",
    };
  }

  revalidatePath(`/oprema-klijenta/${clientId}`);
  return { success: true };
}
