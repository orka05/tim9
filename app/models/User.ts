/**
 * Apstraktni domenski entitet Korisnika (Model sloj).
 * Zajednička osnova (nadklasa) za sve tipove naloga u sistemu:
 * Trenera, Klijenta i Administratora. Sadrži atribute koje svi korisnici dele.
 */
export abstract class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public password: string,
  ) {}
}
