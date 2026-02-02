import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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

  // Méthode de test pour vérifier la connectivité
  testerConnexion(): Observable<any> {
    const url = `${this.apiUrl}/test`;
    console.log('🧪 [FRONTEND-SERVICE] === DEBUT testerConnexion ===');
    console.log('🧪 [FRONTEND-SERVICE] URL complète:', url);
    console.log('🧪 [FRONTEND-SERVICE] apiUrl configuré:', this.apiUrl);
    console.log('🧪 [FRONTEND-SERVICE] environment.apiUrl:', environment.apiUrl);
    
    return this.http.get<any>(url).pipe(
      tap({
        next: (response) => {
          console.log('✅ [FRONTEND-SERVICE] Test connexion réussi:', response);
          console.log('🧪 [FRONTEND-SERVICE] === FIN testerConnexion (SUCCESS) ===');
        },
        error: (error) => {
          console.error('❌ [FRONTEND-SERVICE] Test connexion échoué:', error);
          console.error('❌ [FRONTEND-SERVICE] Status:', error.status);
          console.error('❌ [FRONTEND-SERVICE] StatusText:', error.statusText);
          console.error('❌ [FRONTEND-SERVICE] URL:', error.url);
          console.error('❌ [FRONTEND-SERVICE] Error details:', {
            message: error.error?.message || error.message,
            code: error.error?.code,
            originalStatus: error.error?.originalStatus
          });
          console.log('🧪 [FRONTEND-SERVICE] === FIN testerConnexion (ERROR) ===');
        }
      }),
      catchError((error) => {
        // Transformation de l'erreur pour un message plus clair
        const friendlyMessage = this.getFriendlyErrorMessage(error);
        return throwError(() => ({
          ...error,
          friendlyMessage
        }));
      })
    );
  }

  // Créer un nouvel étage
  creerEtage(etageData: EtageRequest): Observable<ApiResponse<{ etage: Etage }>> {
    const url = this.apiUrl;
    console.log('🏢 [FRONTEND-SERVICE] === DEBUT creerEtage ===');
    console.log('🏢 [FRONTEND-SERVICE] URL:', url);
    console.log('🏢 [FRONTEND-SERVICE] Données:', etageData);
    
    return this.http.post<ApiResponse<{ etage: Etage }>>(url, etageData).pipe(
      tap({
        next: (response) => {
          console.log('✅ [FRONTEND-SERVICE] Création étage réussie:', response);
          console.log('🏢 [FRONTEND-SERVICE] === FIN creerEtage (SUCCESS) ===');
        },
        error: (error) => {
          console.error('❌ [FRONTEND-SERVICE] Erreur création étage:', error);
          console.log('🏢 [FRONTEND-SERVICE] === FIN creerEtage (ERROR) ===');
        }
      })
    );
  }

  // Obtenir tous les étages
  obtenirEtages(options: {
    page?: number;
    limit?: number;
    actifSeulement?: boolean;
  } = {}): Observable<EtagesResponse> {
    console.log('🏢 [FRONTEND-SERVICE] === DEBUT obtenirEtages ===');
    console.log('🏢 [FRONTEND-SERVICE] Options:', options);
    
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.actifSeulement !== undefined) {
      params = params.set('actifSeulement', options.actifSeulement.toString());
    }

    const url = this.apiUrl;
    console.log('🏢 [FRONTEND-SERVICE] URL complète:', url);
    console.log('🏢 [FRONTEND-SERVICE] Params:', params.toString());

    return this.http.get<EtagesResponse>(url, { params }).pipe(
      tap({
        next: (response) => {
          console.log('✅ [FRONTEND-SERVICE] Étages récupérés:', response);
          console.log('🏢 [FRONTEND-SERVICE] === FIN obtenirEtages (SUCCESS) ===');
        },
        error: (error) => {
          console.error('❌ [FRONTEND-SERVICE] Erreur récupération étages:', error);
          console.error('❌ [FRONTEND-SERVICE] Status:', error.status);
          console.error('❌ [FRONTEND-SERVICE] URL:', error.url);
          console.error('❌ [FRONTEND-SERVICE] Error details:', {
            message: error.error?.message || error.message,
            code: error.error?.code,
            originalStatus: error.error?.originalStatus
          });
          console.log('🏢 [FRONTEND-SERVICE] === FIN obtenirEtages (ERROR) ===');
        }
      }),
      catchError((error) => {
        const friendlyMessage = this.getFriendlyErrorMessage(error);
        return throwError(() => ({
          ...error,
          friendlyMessage
        }));
      })
    );
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
    const url = `${this.apiUrl}/stats`;
    console.log('📊 [FRONTEND-SERVICE] === DEBUT obtenirStatistiques ===');
    console.log('📊 [FRONTEND-SERVICE] URL complète:', url);
    
    return this.http.get<{ stats: EtageStatsResponse }>(url).pipe(
      tap({
        next: (response) => {
          console.log('✅ [FRONTEND-SERVICE] Statistiques récupérées:', response);
          console.log('📊 [FRONTEND-SERVICE] === FIN obtenirStatistiques (SUCCESS) ===');
        },
        error: (error) => {
          console.error('❌ [FRONTEND-SERVICE] Erreur statistiques:', error);
          console.error('❌ [FRONTEND-SERVICE] Status:', error.status);
          console.error('❌ [FRONTEND-SERVICE] URL:', error.url);
          console.error('❌ [FRONTEND-SERVICE] Error details:', {
            message: error.error?.message || error.message,
            code: error.error?.code,
            originalStatus: error.error?.originalStatus
          });
          console.log('📊 [FRONTEND-SERVICE] === FIN obtenirStatistiques (ERROR) ===');
        }
      }),
      catchError((error) => {
        const friendlyMessage = this.getFriendlyErrorMessage(error);
        return throwError(() => ({
          ...error,
          friendlyMessage
        }));
      })
    );
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

  /**
   * 🔧 Obtenir un message d'erreur convivial basé sur le type d'erreur
   */
  private getFriendlyErrorMessage(error: any): string {
    if (error.error?.code === 'AUTH_EXPIRED') {
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    }
    
    if (error.error?.code === 'NETWORK_ERROR') {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    }
    
    if (error.error?.code === 'PARSE_ERROR') {
      return 'Erreur de communication avec le serveur. Veuillez réessayer.';
    }
    
    if (error.status === 403) {
      return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
    }
    
    if (error.status === 404) {
      return 'La ressource demandée n\'a pas été trouvée.';
    }
    
    if (error.status >= 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    
    return error.error?.message || error.message || 'Une erreur inattendue s\'est produite.';
  }
}