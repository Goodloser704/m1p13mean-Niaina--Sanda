import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Etage, 
  EtageRequest, 
  EtagesResponse, 
  EtageStatsResponse,
  ApiResponse 
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class EtageService {
  private apiUrl = `${environment.apiUrl}/etages`;

  constructor(private http: HttpClient) {}

  // Créer un nouvel étage
  creerEtage(etageData: EtageRequest): Observable<ApiResponse<{ etage: Etage }>> {
    console.log('🏢 Création étage:', etageData);
    return this.http.post<ApiResponse<{ etage: Etage }>>(this.apiUrl, etageData);
  }

  // Obtenir tous les étages
  obtenirEtages(options: {
    page?: number;
    limit?: number;
    actifSeulement?: boolean;
  } = {}): Observable<EtagesResponse> {
    console.log('🏢 Récupération étages avec options:', options);
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.actifSeulement !== undefined) {
      params = params.set('actifSeulement', options.actifSeulement.toString());
    }

    console.log('🏢 URL de requête:', this.apiUrl);
    return this.http.get<EtagesResponse>(this.apiUrl, { params });
  }

  // Obtenir un étage par ID
  obtenirEtageParId(id: string): Observable<{ etage: Etage }> {
    return this.http.get<{ etage: Etage }>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un étage
  mettreAJourEtage(id: string, etageData: Partial<EtageRequest>): Observable<ApiResponse<{ etage: Etage }>> {
    return this.http.put<ApiResponse<{ etage: Etage }>>(`${this.apiUrl}/${id}`, etageData);
  }

  // Supprimer un étage
  supprimerEtage(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  // Obtenir les statistiques des étages
  obtenirStatistiques(): Observable<{ stats: EtageStatsResponse }> {
    return this.http.get<{ stats: EtageStatsResponse }>(`${this.apiUrl}/stats`);
  }

  // Obtenir la liste simple des étages (pour les selects)
  obtenirListeEtages(): Observable<Array<{ numero: number; nom: string }>> {
    return new Observable(observer => {
      this.obtenirEtages({ actifSeulement: true }).subscribe({
        next: (response) => {
          const listeSimple = response.etages.map(etage => ({
            numero: etage.numero,
            nom: etage.nom
          }));
          observer.next(listeSimple);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}