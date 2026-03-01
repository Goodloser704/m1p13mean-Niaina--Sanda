import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Boutique, BoutiqueStatsResponse, StatutBoutique } from '../../models/commercant/boutique.model';
import { Pagination } from '../../models/pagination.model';
import { Produit } from '../../models/commercant/produit.model';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  apiUrl = environment.apiUrl;

  readonly BOUTIQUE_KEY = "ma_boutique";
  private _maBoutique = signal<Boutique | null>(null);
  readonly maBoutique = this._maBoutique.asReadonly();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const stored = localStorage.getItem(this.BOUTIQUE_KEY);
    if (stored) {
      this._maBoutique.set(JSON.parse(stored));
    }
  }

  setMaBoutique(maBoutique: Boutique) {
    this._maBoutique.set(maBoutique);
    localStorage.setItem(this.BOUTIQUE_KEY, JSON.stringify(maBoutique));
  }

  freeMaBoutique() {
    this._maBoutique.set(null);
    localStorage.removeItem(this.BOUTIQUE_KEY);
  }

  allerVersMaBoutique(maBoutique: Boutique) {
    this.setMaBoutique(maBoutique);
    this.router.navigate(['/commercant/ma-boutique']);
  }

  quitterMaBoutique(route: string) {
    this.freeMaBoutique();
    this.router.navigate([route]);
  }

  // ---- API ----

  searchBoutique(keyword: string, page = 1, limit = 10) {
    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutiques/search`,
      {
        params: {
          keyword: keyword,
          page: page,
          limit: limit
        }
      }
    );
  }

  getBoutiqueProduits({
    idBoutique, 
    page = 1, 
    limit = 10,
    disponibleOnly = false,
    statutBoutique,
  }: {
    idBoutique: string,
    page?: number,
    limit?: number,
    disponibleOnly?: boolean,
    statutBoutique?: StatutBoutique
  }) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (disponibleOnly !== undefined) {
      params = params.set('disponibleOnly', disponibleOnly);
    }

    if (statutBoutique !== undefined) {
      params = params.set('statutBoutique', statutBoutique);
    }

    return this.http.get<{ produits: Produit[], boutique: Boutique, pagination: Pagination }>(
      `${this.apiUrl}/api/boutiques/${idBoutique}/produits`,
      { params }
    );
  }

  getCommercantBoutiques(idCommercant: string) {
    return this.http.get<{ boutiques: Boutique[] }>(
      `${this.apiUrl}/api/commercant/${idCommercant}/boutiques`
    );
  }

  getBoutiqueById(idBoutique: string) {
    return this.http.get<{ boutique: Boutique }>(
      `${this.apiUrl}/api/commercant/boutique/${idBoutique}`
    );
  }

  creerBoutique(boutique: Boutique) {
    return this.http.post<{ message: string, boutique: Boutique }>(
      `${this.apiUrl}/api/boutique/register`,
      boutique
    )
  }

  getMyBoutiques() {
    return this.http.get<{ boutiques: Boutique[], count: number }>(
      `${this.apiUrl}/api/boutique/my-boutiques`
    );
  }

  getMyBoutique(idBoutique: string) {
    return this.http.get<{ boutique: Boutique }>(
      `${this.apiUrl}/api/boutique/me/${idBoutique}`
    );
  }

  // en attente
  getPendingBoutiques() {
    return this.http.get<{ boutiques: Boutique[], count: number }>(
      `${this.apiUrl}/api/boutique/pending`
    );
  }

  updateMyBoutique(boutique: Boutique) {
    return this.http.put<{ message: string, boutique: Boutique }>(
      `${this.apiUrl}/api/boutique/me/${boutique._id}`,
      boutique
    );
  }

  deleteMyBoutique(idBoutique: string) {
    return this.http.delete<any>(`${this.apiUrl}/api/boutique/me/${idBoutique}`);
  }

  getAllBoutiques(page = 1, limit = 10) {
    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutique/all`,
      {
        params: {
          page: page,
          limit: limit
        }
      }
    )
  }

  getAllBoutiqueByStatut(statutBoutique: StatutBoutique, page = 1, limit = 10) {
    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutique/by-statut`,
      {
        params: {
          statut: statutBoutique,
          page: page,
          limit: limit
        }
      }
    );
  }

  getBoutiqueStats() {
    return this.http.get<BoutiqueStatsResponse>(`${this.apiUrl}/api/boutique/admin/stats`);
  }

  // -- End API --

}
