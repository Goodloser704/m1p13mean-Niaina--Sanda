import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pagination } from '../../models/pagination.model';
import { TypeProduit } from '../../models/commercant/type-produit.model';

@Injectable({
  providedIn: 'root',
})
export class TypeProduitService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // public 
  obtenirTousLesTypes() {
    return this.http.get<{ typesProduit: TypeProduit[], pagination: Pagination }>(
      `${this.apiUrl}/api/types-produit`
    );
  }

  // public
  obtenirLesTypesParBoutique(idBoutique: string) {
    return this.http.get<{ typesProduits: TypeProduit[] }>(
      `${this.apiUrl}/api/types-produit/boutique/${idBoutique}`
    );
  }

  obtenirMesTypes() {
    return this.http.get<{ typesProduits: TypeProduit[] }>(
      `${this.apiUrl}/api/types-produit/me`
    );
  }

  creerTypeProduit(typeProduit: TypeProduit) {
    return this.http.post<{ message: string, typeProduit: TypeProduit }>(
      `${this.apiUrl}/api/types-produit`,
      typeProduit
    );
  }

  modifierTypeProduit(typeProduit: TypeProduit) {
    return this.http.put<{ message: string, typeProduit: TypeProduit }>(
      `${this.apiUrl}/api/types-produit/${typeProduit._id}`,
      typeProduit
    );
  }

  supprimerTypeProduit(idTypeProduit: string) {
    return this.http.delete<any>(
      `${this.apiUrl}/api/types-produit/${idTypeProduit}`
    );
  }

}
