import { TypeAchat } from "./achat.model";

export interface PanierItem {
  produitId: string;

  // Champs UI
  nom: string;
  photo: string | null;

  prixUnitaire: number;
  quantite: number;
  typeAchat: TypeAchat;

  // Calculé côté front
  montantLigne: number;
}

export interface Panier {
  achats: PanierItem[];
  montantTotal: number;

  // Champs UI optionnels
  totalArticles: number;
  updatedAt: string;
}

export interface PanierValidationPayload {
  achats: {
    produit: string;
    quantite: number;
    typeAchat: TypeAchat;
    prixUnitaire: number;
  }[];
  montantTotal: number;
}