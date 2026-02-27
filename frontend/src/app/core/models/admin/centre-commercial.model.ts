export interface CentreCommercial {
  _id: string,
  nom: string,
  description?: string | null,
  adresse: string,
  email?: string | null,
  telephone?: string | null,
  photo?: string | null,
  createdAt: string,
  updatedAt: string
}
