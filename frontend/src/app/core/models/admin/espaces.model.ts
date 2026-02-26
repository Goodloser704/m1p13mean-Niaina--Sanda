import { CentreCommercial } from "../../../pages/admin/centre-commercial/centre-commercial"
import { Boutique } from "../commercant/boutique.model"

export interface Etage {
  _id: string,
  numero: number,
  niveau: number,
  nom: string,
  description: string | null,
  isActive: boolean
}

export enum EspaceStatut {
  Disponible = "Disponible",
  Occupee = "Occupee"
}

export interface Espace {
  _id: string,
  centreCommercial: CentreCommercial | string,
  code: string,
  surface: number,
  etage: Etage | string,
  loyer: number,
  statut: EspaceStatut,
  boutique: Boutique | string | null,
  createdAt: string,
  updatedAt: string
}

export interface EspaceQueryParams {
  page?: number;
  limit?: number;
  etage?: string;
  statut?: EspaceStatut;
  surfaceMin?: number;
  surfaceMax?: number;
  loyerMax?: number;
  search?: string;
  actifSeulement?: boolean;
}

export interface EspacesResponse {
  espaces: Espace[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EspacesStatsResponse {
  totalEspaces: number,
  espacesDisponibles: number,
  espacesOccupes: number,
  tauxOccupation: number
}

export function getEspaceEtageNiveau(espace: Espace): number {
  const etage = espace.etage;

  if (typeof etage === 'object' && etage !== null) {
    return etage.niveau;
  }
  return -111;
}

export function getEtage(espace: Espace ): Etage {
  const etage = espace.etage;
  if (typeof etage === 'object' && etage !== null) {
    return etage;
  }

  const partialEtage: Partial<Etage> = { _id: etage };
  return partialEtage as Etage;
}

export function getEspaceBoutiqueNames(espaceBoutique: Boutique | string | null): string {
  if (!espaceBoutique) return '';

  if (typeof espaceBoutique === 'object') {
    return espaceBoutique.nom;
  }

  return `Ref ${espaceBoutique.slice(0, 4)}...`;
}
