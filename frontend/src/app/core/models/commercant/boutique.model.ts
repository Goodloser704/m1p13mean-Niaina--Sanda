import { CategorieBoutique } from "../admin/categorie-boutique.model";
import { Espace, getEspaceEtageNiveau } from "../admin/espaces.model";
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

export function getBoutiqueCategorieLabel(boutique: Boutique): string {
  const categorie = boutique.categorie;
  return typeof categorie === 'object' && categorie !== null ? categorie.nom : '';
}

export function getBoutiqueCommercantLabel(boutique: Boutique): string {
  const commercant = boutique.commercant as User | string;

  if (typeof commercant === 'object' && commercant !== null) {
    return `${commercant.nom} ${commercant.prenoms}`;
  }

  return '';
}

export function getBoutiqueEspaceCode(boutique: Boutique): string {
  const espace = boutique.espace as Espace | string | null;
  if (typeof espace === 'object' && espace !== null) {
    return espace.codeEspace;
  }
  return '';
}

export function getBoutiqueEspaceEtageNiveau(boutique: Boutique): number {
  const espace = boutique.espace as Espace | string | null;
  if (typeof espace === 'object' && espace !== null) {
    return getEspaceEtageNiveau(espace);
  }
  return -111;
}