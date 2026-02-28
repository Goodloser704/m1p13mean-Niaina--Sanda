import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoyerService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Payer le loyer pour un ou plusieurs espaces
  payerLoyer(data: { boutiqueId?: string; montant?: number; periode?: string }) {
    return this.http.post<any>(`${this.apiUrl}/api/commercant/loyers/pay`, data);
  }

  // Obtenir l'historique des paiements
  obtenirHistorique(params?: { page?: number; limit?: number }): Observable<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.http.get<any>(
      `${this.apiUrl}/api/commercant/loyers/historique?${queryParams.toString()}`
    );
  }

  // Obtenir un reçu
  obtenirRecepisse(idTransaction: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/api/commercant/loyers/recepisse/${idTransaction}`
    );
  }
}
