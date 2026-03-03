import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoyerPaiement, LoyerStats, PaiementsMoisCourantResponse } from '../../models/commercant/commercant.model';
import { Recepisse } from '../../models/recepisse.model';
import { PFTransaction } from '../../models/porte-feuille.model';
import { Pagination } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class LoyerService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  payerLoyer(data: LoyerPaiement) {
    return this.http.post<{
      message: string,
      recepisse: Recepisse,
      transaction: PFTransaction,
      nouveauSolde: number
    }>(`${this.apiUrl}/api/commercant/loyers/pay`, data);
  }

  // Commercant
  obtenirMesHistoriqueLoyers(page = 1, limit = 10) {
    return this.http.get<{ loyers: PFTransaction[], pagination: Pagination }>(
      `${this.apiUrl}/api/commercant/loyers/historique`,
      {
        params: {
          page: page,
          limit: limit
        }
      }
    );
  }

  // Commercant
  obtenirRecepisse(idTransaction: string) {
    return this.http.get<{ recepisse: Recepisse }>(
      `${this.apiUrl}/api/commercant/loyers/recepisse/${idTransaction}`
    );
  }

  // Admin
  obtenirHistoriqueLoyers(mois: string /* MM */, annee: string /* YYYY */, page = 1, limit = 10) {
    return this.http.get<{
      loyers: Recepisse[],
      statistiques: LoyerStats,
      pagination: Pagination
    }>(
      `${this.apiUrl}/api/admin/loyers/historique-par-periode`,
      {
        params: {
          mois: mois,
          annee: annee,
          page: page,
          limit: limit
        }
      }
    )
  }

  obtenirHistorique(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.http.get<{
      loyers: Recepisse[],
      pagination: Pagination
    }>(
      `${this.apiUrl}/api/commercant/loyers/historique?${queryParams.toString()}`
    );
  }

  // Admin
  getStatutPaimentsMoisCourant() {
    return this.http.get<PaiementsMoisCourantResponse>(
      `${this.apiUrl}/api/admin/loyers/statut-paiements-mois-courant`
    );
  }
}
