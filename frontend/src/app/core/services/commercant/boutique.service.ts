import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Boutique, StatutBoutique } from '../../models/commercant/boutique.model';
import { Pagination } from '../../models/pagination.model';
import { Produit } from '../../models/commercant/produit.model';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

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

  getBoutiqueProduits(idBoutique: string, page = 1, limit = 10) {
    return this.http.get<{ produits: Produit[], boutique: Boutique, pagination: Pagination }>(
      `${this.apiUrl}/api/boutiques/${idBoutique}/produits`,
      {
        params: {
          page: page,
          limit: limit
        }
      }
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
      `${this.apiUrl}/api/boutique/all/statut/${statutBoutique}`,
      {
        params: {
          page: page,
          limit: limit
        }
      }
    );
  }

  getActiveBoutiques(page = 1, limit = 10) {
    return this.getAllBoutiqueByStatut(StatutBoutique.Actif, page, limit);
  }

  getInactiveBoutiques(page = 1, limit = 10) {
    return this.getAllBoutiqueByStatut(StatutBoutique.Inactif, page, limit);
  }
}
