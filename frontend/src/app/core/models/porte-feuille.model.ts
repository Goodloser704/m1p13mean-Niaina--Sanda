import { User } from "./user.model";

export interface PorteFeuille {
  _id: string;
  owner: User | string,
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

export interface PFTransaction {
  _id: string;
  fromWallet: PorteFeuille | string;
  toWallet: PorteFeuille | string;
  type: PFTransactionType,
  amount: number,
  description: string,
  statut: string,
  createdAt: string
}

export interface UserPorteFeuille {
  wallet: PorteFeuille,
  transactions: PFTransaction[]
}