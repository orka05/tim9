/** Domenski entitet Klijenta. */
export class Client {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public password: string,
    public readonly createdAt: Date,
    public height: number | null = null,
    public weight: number | null = null,
    public age: number | null = null,
    public rating: number = 0,
  ) {}
}
