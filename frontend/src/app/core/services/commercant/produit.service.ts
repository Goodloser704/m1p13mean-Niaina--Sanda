import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../../models/pagination.model';
import { Produit } from '../../models/commercant/produit.model';

@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  apiUrl: string = environment.apiUrl;
  defaultUrl: string = `${this.apiUrl}/api/commercant/produits`;

  constructor(private http: HttpClient) {}

  obtenirProduits(
    search?: string,
    idBoutique?: string,
    idType?: string,
    stockMin = 0,
    page = 1, 
    limit = 10
  ) {
    let params = new HttpParams()
      .set('stockMin', stockMin.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search !== undefined) params = params.set('search', search);
    if (idBoutique !== undefined) params = params.set('boutiqueId', idBoutique);
    if (idType !== undefined) params = params.set('typeId', idType);

    return this.http.get<{ produits: Produit[], pagination: Pagination }>(
      this.defaultUrl,
      { params }
    );
  }

  obtenirProduitParId(idProduit: string) {
    return this.http.get<{ produit: Produit }>(`${this.defaultUrl}/${idProduit}`);
  }

  creerProduit(produit: Produit) {
    return this.http.post<{ message: string, produit: Produit }>(
      this.defaultUrl,
      produit
    );
  }

  modifierProduit(produit: Produit) {
    return this.http.put<{ message: string, produit: Produit }>(
      `${this.defaultUrl}/${produit._id}`,
      produit
    );
  }

  supprimerProduit(idProduit: string) {
    return this.http.delete<any>(`${this.defaultUrl}/${idProduit}`);
  }

  modifierStock(idProduit: string, nombreDispo: number) {
    return this.http.put<{ message: string, produit: Produit }>(
      `${this.defaultUrl}/${idProduit}/stock`,
      { nombreDispo }
    );
  }
}
