import { Boutique } from "./boutique.model";

export interface TypeProduit {
  _id: string,
  nom: String
}

export interface Produit {
  _id: string,
  nom: string,
  description: string | null,
  prix: number,
  typeProduit: TypeProduit | string,
  boutique: Boutique | string,
  tempsPreparation: string | null,
  stock: {
    nombreDispo: number,
    updatedAt: string
  },
  createdAt: string,
  updatedAt: string
}