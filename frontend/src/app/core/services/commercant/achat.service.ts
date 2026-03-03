import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AchatCommercantService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtenir les achats en cours
  obtenirAchatsEnCours(params?: { page?: number; limit?: number; boutiqueId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.boutiqueId) queryParams.append('boutiqueId', params.boutiqueId);

    return this.http.get<any>(
      `${this.apiUrl}/api/commercant/achats/en-cours?${queryParams.toString()}`
    );
  }

  // Valider la livraison
  validerLivraison(achatId: string, dureeLivraison: string) {
    return this.http.put<any>(
      `${this.apiUrl}/api/commercant/achats/${achatId}/livraison`,
      { dureeLivraison }
    );
  }
}
