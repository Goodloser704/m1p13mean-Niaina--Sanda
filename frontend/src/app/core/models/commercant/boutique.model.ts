import { CategorieBoutique } from "../admin/categorie-boutique.model";
import { Espace } from "../admin/espaces.model";
import { User } from "../user.model";

export enum JourSemaine {
  Lundi = "Lundi",
  Mardi = "Mardi",
  Mercredi = "Mercredi",
  Jeudi = "Jeudi",
  Vendredi = "Vendredi",
  Samedi = "Samedi",
  Dimanche = "Dimanche"
}

export enum StatutBoutique {
  Actif = "Actif",
  Inactif = "Inactif"
}

export interface Boutique {
  _id: string,
  nom: string,
  description: string | null,
  commercant: User | string,
  categorie: CategorieBoutique | string,
  statutBoutique: StatutBoutique,
  photo: string | null,
  espace: Espace | string | null,
  horairesHebdo: JourSemaine,
  createdAt: string,
  updatedAt: string
}