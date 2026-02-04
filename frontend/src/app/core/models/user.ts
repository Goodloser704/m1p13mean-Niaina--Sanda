export enum UserRole {
  Admin = "Admin",
  Commercant = "Commercant",
  Acheteur = "Acheteur"
}

export interface User {
  _id: string,
  nom: string,
  prenoms: string,
  email: string,
  telephone?: string | null,
  mdp: string,
  photo?: string | null,
  role: string,
  createdAt: string,
  updatedAt: string
}
