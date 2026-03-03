import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pagination } from '../../models/pagination.model';
import { Boutique } from '../../models/acheteur/boutique.model';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtenir toutes les boutiques (public)
  obtenirToutesLesBoutiques(params?: { page?: number; limit?: number; categorieId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.categorieId) queryParams.append('categorieId', params.categorieId);

    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutiques?${queryParams.toString()}`
    );
  }

  // Obtenir une boutique par ID
  obtenirBoutiqueParId(idBoutique: string) {
    return this.http.get<{ boutique: Boutique }>(
      `${this.apiUrl}/api/boutiques/${idBoutique}`
    );
  }

  // Obtenir les produits d'une boutique
  obtenirProduitsBoutique(idBoutique: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.http.get<any>(
      `${this.apiUrl}/api/boutiques/${idBoutique}/produits?${queryParams.toString()}`
    );
  }
}
