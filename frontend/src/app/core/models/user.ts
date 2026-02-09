export enum UserRole {
  Admin = "Admin",
  Commercant = "Commercant",
  Acheteur = "Acheteur"
}

export enum Genre {
  Masculin = "Masculin",
  Feminin = "Feminin"
}

export interface User {
  _id: string,
  nom: string,
  prenoms: string,
  genre: Genre | null,
  email: string,
  telephone?: string | null,
  mdp: string,
  photo?: string | null,
  role: UserRole,
  createdAt: string,
  updatedAt: string
}
