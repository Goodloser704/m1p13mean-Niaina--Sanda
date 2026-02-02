import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Espace, 
  EspaceRequest, 
  EspacesResponse, 
  EspaceFilters,
  EspaceStatsResponse,
  ApiResponse 
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  private apiUrl = `${environment.apiUrl}/espaces`;

  constructor(private http: HttpClient) {}

  // Créer un nouvel espace
  creerEspace(espaceData: EspaceRequest): Observable<ApiResponse<{ espace: Espace }>> {
    return this.http.post<ApiResponse<{ espace: Espace }>>(this.apiUrl, espaceData);
  }

  // Obtenir tous les espaces avec filtres
  obtenirEspaces(filters: EspaceFilters = {}): Observable<EspacesResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof EspaceFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<EspacesResponse>(this.apiUrl, { params });
  }

  // Obtenir un espace par ID
  obtenirEspaceParId(id: string): Observable<{ espace: Espace }> {
    return this.http.get<{ espace: Espace }>(`${this.apiUrl}/${id}`);
  }

  // Obtenir un espace par code
  obtenirEspaceParCode(code: string): Observable<{ espace: Espace }> {
    return this.http.get<{ espace: Espace }>(`${this.apiUrl}/code/${code}`);
  }

  // Mettre à jour un espace
  mettreAJourEspace(id: string, espaceData: Partial<EspaceRequest>): Observable<ApiResponse<{ espace: Espace }>> {
    return this.http.put<ApiResponse<{ espace: Espace }>>(`${this.apiUrl}/${id}`, espaceData);
  }

  // Supprimer un espace
  supprimerEspace(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  // Occuper un espace
  occuperEspace(id: string, boutiqueId: string): Observable<ApiResponse<{ espace: Espace }>> {
    return this.http.put<ApiResponse<{ espace: Espace }>>(`${this.apiUrl}/${id}/occuper`, { boutiqueId });
  }

  // Libérer un espace
  libererEspace(id: string): Observable<ApiResponse<{ espace: Espace }>> {
    return this.http.put<ApiResponse<{ espace: Espace }>>(`${this.apiUrl}/${id}/liberer`, {});
  }

  // Rechercher des espaces disponibles
  rechercherEspacesDisponibles(criteres: {
    etage?: number;
    surfaceMin?: number;
    surfaceMax?: number;
    loyerMax?: number;
  } = {}): Observable<{ espaces: Espace[] }> {
    let params = new HttpParams();
    
    Object.keys(criteres).forEach(key => {
      const value = criteres[key as keyof typeof criteres];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<{ espaces: Espace[] }>(`${this.apiUrl}/disponibles`, { params });
  }

  // Obtenir les statistiques des espaces
  obtenirStatistiques(): Observable<{ stats: EspaceStatsResponse }> {
    return this.http.get<{ stats: EspaceStatsResponse }>(`${this.apiUrl}/stats`);
  }

  // Méthodes utilitaires
  calculerPrixParM2(espace: Espace): number {
    return espace.surface > 0 ? Math.round((espace.loyer / espace.surface) * 100) / 100 : 0;
  }

  formaterSurface(surface: number): string {
    return `${surface} m²`;
  }

  formaterLoyer(loyer: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(loyer);
  }

  obtenirCouleurStatut(statut: string): string {
    switch (statut) {
      case 'Disponible': return '#28a745';
      case 'Occupe': return '#dc3545';
      default: return '#6c757d';
    }
  }

  obtenirIconeStatut(statut: string): string {
    switch (statut) {
      case 'Disponible': return '✅';
      case 'Occupe': return '🔴';
      default: return '❓';
    }
  }
}