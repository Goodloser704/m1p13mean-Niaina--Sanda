import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CategorieBoutique } from '../../models/admin/categorie-boutique.model';

@Injectable({
  providedIn: 'root',
})
export class CategorieBoutiqueService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenirCategories() {
    return this.http.get<{ categories: CategorieBoutique[], count: number }>(
      `${this.apiUrl}/api/categories-boutique`,
      { params: { actives: true } }
    )
  }

  obtenirCategorieParId(idCategorie: string) {
    return this.http.get<{ categorie: CategorieBoutique }>(
      `${this.apiUrl}/api/categories-boutique/${idCategorie}`
    );
  }

  creerCategorie(categorie: CategorieBoutique) {
    return this.http.post<{ categorie: CategorieBoutique }>(
      `${this.apiUrl}/api/categories-boutique`,
      categorie
    );
  }

  updateCategorie(categorie: CategorieBoutique) {
    return this.http.put<{ categorie: CategorieBoutique }>(
      `${this.apiUrl}/api/categories-boutique/${categorie._id}`,
      categorie
    );
  }

  deleteCategorie(idCategorie: string) {
    return this.http.delete<any>(`${this.apiUrl}/api/categories-boutique/${idCategorie}`);
  }
}
