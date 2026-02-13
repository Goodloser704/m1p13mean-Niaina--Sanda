import { User } from "./user";

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

export interface PFTransaction {
  _id: string;
  fromWallet: PorteFeuille | string;
  toWallet: PorteFeuille | string;
  type: PFTransactionType,
  amount: number,
  description: string,
  createdAt: string
}

export interface UserPorteFeuille {
  wallet: PorteFeuille,
  transactions: PFTransaction[]
}