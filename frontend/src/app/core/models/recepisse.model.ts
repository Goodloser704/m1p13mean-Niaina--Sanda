import { PFTransaction } from "./porte-feuille.model";
import { User } from "./user.model";

export interface Recepisse {
  _id: string,
  numeroRecepisse: string,
  receveur: User, // nom, prenoms, email
  donneur: User, // nom, prenoms, email
  description: string,
  transaction: PFTransaction,
  montant: number,
  type: string,
  periode: string
  dateEmission: string,
  createdAt: string
}