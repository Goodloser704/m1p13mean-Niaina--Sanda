import { Boutique } from "./boutique.model";

export interface TypeProduit {
  _id: string,
  type: string,
  boutique: Boutique | string,
  description: string | null,
  icone: string | null,
  couleur: string | null,
  isActive: boolean
}