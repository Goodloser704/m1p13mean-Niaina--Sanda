import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CentreCommercial {
  _id: string;
  nom: string;
  description?: string;
  adresse: string;
  email?: string;
  telephone?: string;
  photo?: string;
  horairesGeneraux?: Array<{
    jour: string;
    debut: string;
    fin: string;
    ferme?: boolean;
  }>;
  siteWeb?: string;
  reseauxSociaux?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CentreCommercialRequest {
  nom: string;
  description?: string;
  adresse: string;
  email?: string;
  telephone?: string;
  photo?: string;
  horairesGeneraux?: Array<{
    jour: string;
    debut: string;
    fin: string;
    ferme?: boolean;
  }>;
  siteWeb?: string;
  reseauxSociaux?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface CentreCommercialStats {
  centreCommercial: CentreCommercial | null;
  statistiques: {
    nombreEtages: number;
    nombreEspaces: number;
    espacesDisponibles: number;
    espacesOccupes: number;
    tauxOccupation: string;
    nombreBoutiques: number;
    boutiquesActives: number;
    boutiquesInactives: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CentreCommercialService {
  private apiUrl = `${environment.apiUrl}/centre-commercial`;

  constructor(private http: HttpClient) {}

  // Obtenir les informations du centre commercial (public)
  obtenirCentreCommercial(): Observable<{ centreCommercial: CentreCommercial }> {
    return this.http.get<{ centreCommercial: CentreCommercial }>(this.apiUrl);
  }

  // Modifier les informations du centre commercial (admin)
  modifierCentreCommercial(data: CentreCommercialRequest): Observable<{ message: string; centreCommercial: CentreCommercial }> {
    return this.http.put<{ message: string; centreCommercial: CentreCommercial }>(this.apiUrl, data);
  }

  // Obtenir les statistiques du centre commercial (admin)
  obtenirStatistiques(): Observable<CentreCommercialStats> {
    return this.http.get<CentreCommercialStats>(`${this.apiUrl}/stats`);
  }
}