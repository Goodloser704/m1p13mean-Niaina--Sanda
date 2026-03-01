import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PortefeuilleService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtenir mon portefeuille
  obtenirMonPortefeuille() {
    return this.http.get<{ portefeuille: any }>(
      `${this.apiUrl}/api/portefeuille/me`
    );
  }

  // Obtenir mes transactions
  obtenirMesTransactions(params?: { page?: number; limit?: number; type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);

    return this.http.get<any>(
      `${this.apiUrl}/api/portefeuille/transactions?${queryParams.toString()}`
    );
  }

  // Recharger le portefeuille
  rechargerPortefeuille(montant: number, modePaiement: string = 'Carte') {
    return this.http.post<any>(
      `${this.apiUrl}/api/portefeuille/recharge`,
      { montant, modePaiement }
    );
  }

  // Obtenir les statistiques
  obtenirStatistiques() {
    return this.http.get<any>(
      `${this.apiUrl}/api/portefeuille/stats`
    );
  }
}
