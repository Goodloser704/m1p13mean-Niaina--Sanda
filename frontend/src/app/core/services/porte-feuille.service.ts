import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { PFTransaction, PorteFeuilleStatistique, UserPorteFeuille } from '../models/porte-feuille.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class PorteFeuilleService {
  apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  obtenirMonPorteFeuille(userId: string): Observable<UserPorteFeuille> {
    return this.http.get<UserPorteFeuille>(`${this.apiUrl}/api/users/${userId}/wallet`);
  }

  obtenirMesTransactions(params?: { page?: number; limit?: number; type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);

    return this.http.get<{
      transactions: PFTransaction[],
      pagination: Pagination
    }>(
      `${this.apiUrl}/api/portefeuille/transactions?${queryParams.toString()}`
    );
  }

  obtenirStatistiques() {
    return this.http.get<{ statistiques: PorteFeuilleStatistique }>(`${this.apiUrl}/api/portefeuille/stats`);
  }

  // -------------------------------------

  // Obtenir le solde
  obtenirSolde() {
    return this.http.get<{ balance: number }>(
      `${this.apiUrl}/api/portefeuille/me`
    );
  }


}
