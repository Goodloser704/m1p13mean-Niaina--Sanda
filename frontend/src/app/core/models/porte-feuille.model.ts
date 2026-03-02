import { User } from "./user.model";

export interface PorteFeuille {
  _id: string;
  owner: User,
  balance: number,
  createdAt: string,
  updatedAt: string
}

export enum PFTransactionType {
  Achat = "Achat",
  Loyer = "Loyer",
  Commission = "Commission"
}

export enum PFTransactionStatut {
  EnAttente = "EnAttente",
  Completee = "Completee",
  Echouee = "Echouee",
  Annulee = "Annulee"
}

export enum TypeForUser {
  Entree = "Entree",
  Sortie = "Sortie"
}

export interface PFTransaction {
  _id: string;
  fromWallet: PorteFeuille;
  toWallet: PorteFeuille;
  type: PFTransactionType,
  amount: number,
  description: string,
  statut: string,
  createdAt: string,
  typeForUser: TypeForUser
}

export interface UserPorteFeuille {
  wallet: PorteFeuille,
  transactions: PFTransaction[]
}