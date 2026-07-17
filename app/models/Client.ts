/** Domenski entitet Klijenta. */
export class Client {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public password: string,
    public readonly createdAt: Date,
  ) {}
}
