import { PFTransaction } from "./porte-feuille.model";
import { User } from "./user.model";

export interface Recepisse {
  _id: string,
  numeroRecepisse: string,
  receveur: User | string,
  donneur: User | string,
  description: string,
  transaction: PFTransaction | string,
  montant: number,
  type: string,
  periode: string
  dateEmission: string,
  createdAt: string
}