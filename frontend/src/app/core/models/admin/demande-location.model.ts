import { Boutique } from "../commercant/boutique.model";
import { Pagination } from "../pagination.model";
import { Espace } from "./espaces.model";

export enum EtatDemandeLocation {
  EnAttente = "EnAttente",
  Acceptee = "Acceptee",
  Refusee = "Refusee"
}

export interface DemandeLocation {
  _id: string,
  boutique: Boutique | string,
  espace: Espace,
  etatDemande: EtatDemandeLocation,
  createdAt: string,
  updatedAt: string
}

export interface DemandeLocationResponse {
  demandes: DemandeLocation[],
  pagination: Pagination
}

export function getBoutiqueId(boutique: Boutique | string): string | null {
  if (typeof boutique === 'object' && boutique !== null) {
    return boutique._id;
  } else if (typeof boutique === 'string') {
    return boutique;
  }
  return null;
}

export function boutiquePresent(boutique: Boutique | string): boolean {
  if (typeof boutique === 'object' && boutique !== null) {
    return true;
  }
  return false;
}

export function getBoutiqueName(boutique: Boutique | string): Boutique | null {
  if (typeof boutique === 'object' && boutique !== null) {
    return boutique;
  }
  return null;
}

export function getEspaceId(espace: Espace | string): string | null {
  if (typeof espace === 'object' && espace !== null) {
    return espace._id;
  } else if (typeof espace === 'string') {
    return espace;
  }
  return null;
}

export function espacePresent(espace: Espace | string): boolean {
  if (typeof espace === 'object' && espace !== null) {
    return true;
  }
  return false;
}

export function getEspaceInfos(espace: Espace | string): Espace | null {
  if (typeof espace === 'object' && espace !== null) {
    return espace;
  }
  return null;
}