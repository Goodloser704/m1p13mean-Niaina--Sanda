import { CentreCommercial } from "../../../pages/admin/centre-commercial/centre-commercial"
import { Boutique } from "../commercant/boutique.model"

export interface Etage {
  _id: string,
  numero: number,
  niveau: number,
  nom: string,
  description: string | null,
  isActive: boolean
}

export enum EspaceStatut {
  Disponible = "Disponible",
  Occupee = "Occupee"
}

export interface Espace {
  _id: string,
  centreCommercial: CentreCommercial | string,
  code: string,
  surface: number,
  etage: Etage | string,
  loyer: number,
  statut: EspaceStatut,
  boutique: Boutique | string | null,
  createdAt: string,
  updatedAt: string
}