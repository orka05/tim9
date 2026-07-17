import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { AdminRepository } from "../repositories/AdminRepository";
import type { Role } from "../lib/session";

export type ProfileData = {
  id: number;
  name: string;
  email: string;
  role: Role;
  specialty?: string;
  city?: string;
  pricePerMonth?: number;
  rating?: number;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
};

/** ViewModel za stranicu profila (klijent / trener / admin). */
export class ProfileViewModel {
  async load(userId: number, role: Role): Promise<ProfileData | null> {
    if (role === "trainer") {
      const trainer = await TrainerRepository.findById(userId);
      if (!trainer) return null;
      return {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
        role: "trainer",
        specialty: trainer.specialty,
        city: trainer.city,
        pricePerMonth: trainer.pricePerMonth,
        rating: trainer.rating,
      };
    }

    if (role === "admin") {
      const admin = await AdminRepository.findById(userId);
      if (!admin) return null;
      return { id: admin.id, name: admin.name, email: admin.email, role: "admin" };
    }

    const client = await ClientRepository.findById(userId);
    if (!client) return null;
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      role: "client",
      height: client.height,
      weight: client.weight,
      age: client.age,
      rating: client.rating,
    };
  }
}
