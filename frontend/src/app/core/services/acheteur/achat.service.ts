import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AchatService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Valider le panier
  validerPanier(achats: any[], montantTotal: number) {
    return this.http.post<any>(
      `${this.apiUrl}/api/achats/panier/valider`,
      { achats, montantTotal }
    );
  }

  // Obtenir mes achats en cours
  obtenirMesAchatsEnCours() {
    return this.http.get<any>(
      `${this.apiUrl}/api/achats/en-cours`
    );
  }

  // Obtenir mon historique d'achats
  obtenirMonHistoriqueAchats(params?: { page?: number; limit?: number; etat?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.etat) queryParams.append('etat', params.etat);

    return this.http.get<any>(
      `${this.apiUrl}/api/achats/historique?${queryParams.toString()}`
    );
  }

  // Obtenir un achat par ID
  obtenirAchatParId(id: string) {
    return this.http.get<any>(
      `${this.apiUrl}/api/achats/${id}`
    );
  }

  // Annuler un achat
  annulerAchat(id: string, raison?: string) {
    return this.http.put<any>(
      `${this.apiUrl}/api/achats/${id}/annuler`,
      { raison }
    );
  }
}
