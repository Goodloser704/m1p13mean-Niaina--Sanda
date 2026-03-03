import { PorteFeuille } from './../../../pages/shared/porte-feuille/porte-feuille';
import { User } from "../user.model";

export enum StatutFacture {
  Brouillon = "Brouillon",
  Emise = "Emise",
  Payee = "Payee",
  Annulee = "Annulee"
}

export enum ModePaiement {
  PorteFeuille = "PorteFeuille",
  Carte = "Carte",
  Especes = "Especes",
  Virement = "Virement"
}

export interface Facture {
  _id: string,
  acheteur: User,
  description: string,
  numeroFacture: string,
  montantTotal: number,
  montantTTC: number,
  tauxTVA: number,
  statut: StatutFacture,
  dateEmission: string,
  dateEcheance: string,
  datePaiement: string,
  modePaiement: ModePaiement,
  createdAt: string,
  updatedAt: string
}