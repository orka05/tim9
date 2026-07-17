import { User } from "./User";

/** Domenski entitet Administratora. Nasleđuje zajedničke atribute iz klase `User`. */
export class Admin extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    public readonly createdAt: Date,
  ) {
    super(id, name, email, password);
  }
}
