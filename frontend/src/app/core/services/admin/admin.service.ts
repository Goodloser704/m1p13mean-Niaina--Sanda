import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Statistiques utilisateurs
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/admin/stats`);
  }

  // Historique loyers par période
  getHistoriqueLoyersParPeriode(params?: { mois?: string; annee?: string; page?: number; limit?: number }): Observable<any> {
    const queryParams = new URLSearchParams();
    if (params?.mois) queryParams.append('mois', params.mois);
    if (params?.annee) queryParams.append('annee', params.annee);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.http.get(`${this.apiUrl}/api/admin/loyers/historique-par-periode?${queryParams.toString()}`);
  }

  // Statut paiements mois courant
  getStatutPaiementsMoisCourant(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/admin/loyers/statut-paiements-mois-courant`);
  }

  // Boutiques payées
  getBoutiquesPayees(mois?: string): Observable<any> {
    const queryParams = mois ? `?mois=${mois}` : '';
    return this.http.get(`${this.apiUrl}/api/admin/loyers/boutiques-payees${queryParams}`);
  }

  // Boutiques impayées
  getBoutiquesImpayees(mois?: string): Observable<any> {
    const queryParams = mois ? `?mois=${mois}` : '';
    return this.http.get(`${this.apiUrl}/api/admin/loyers/boutiques-impayees${queryParams}`);
  }

  // Liste tous les portefeuilles
  getAllPortefeuilles(params?: { page?: number; limit?: number; search?: string }): Observable<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return this.http.get(`${this.apiUrl}/api/portefeuille/admin/all?${queryParams.toString()}`);
  }

  // Statistiques notifications
  getNotificationsStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/notifications/admin/stats`);
  }
}
