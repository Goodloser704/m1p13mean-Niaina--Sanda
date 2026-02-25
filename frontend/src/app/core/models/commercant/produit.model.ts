import { Boutique } from "./boutique.model";
import { TypeProduit } from "./type-produit.model";

export interface Produit {
  _id: string,
  nom: string,
  description: string | null,
  photo: string | null,
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

export function getTypeProduit(product: Produit): TypeProduit | null {
  const type = product.typeProduit
  if (typeof type === 'object' && type !== null) {
    return type
  }
  return null;
}