import { User } from "./User";

/** Domenski entitet Klijenta. Nasleđuje zajedničke atribute iz klase `User`. */
export class Client extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    public readonly createdAt: Date,
    public height: number | null = null,
    public weight: number | null = null,
    public age: number | null = null,
    public rating: number = 0,
  ) {
    super(id, name, email, password);
  }
}
