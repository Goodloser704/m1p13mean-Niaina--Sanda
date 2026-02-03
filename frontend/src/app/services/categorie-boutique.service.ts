import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CategorieBoutique {
  _id: string;
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieBoutiqueService {
  private readonly API_URL = `${environment.apiUrl}/categories-boutique`;

  constructor(private http: HttpClient) {}

  /**
   * 📋 Obtenir toutes les catégories
   */
  obtenirCategories(): Observable<{
    categories: CategorieBoutique[];
    count: number;
  }> {
    return this.http.get<{
      categories: CategorieBoutique[];
      count: number;
    }>(`${this.API_URL}`)
      .pipe(
        tap(response => {
          console.log('📋 Catégories récupérées:', response.count);
        })
      );
  }

  /**
   * 📋 Obtenir les catégories actives seulement
   */
  obtenirCategoriesActives(): Observable<{
    categories: CategorieBoutique[];
    count: number;
  }> {
    return this.http.get<{
      categories: CategorieBoutique[];
      count: number;
    }>(`${this.API_URL}?actives=true`)
      .pipe(
        tap(response => {
          console.log('📋 Catégories actives récupérées:', response.count);
        })
      );
  }

  /**
   * 🔍 Obtenir une catégorie par ID
   */
  obtenirCategorieParId(categorieId: string): Observable<{
    categorie: CategorieBoutique;
  }> {
    return this.http.get<{
      categorie: CategorieBoutique;
    }>(`${this.API_URL}/${categorieId}`);
  }

  /**
   * ➕ Créer une nouvelle catégorie (Admin seulement)
   */
  creerCategorie(categorieData: Partial<CategorieBoutique>): Observable<{
    message: string;
    categorie: CategorieBoutique;
  }> {
    return this.http.post<{
      message: string;
      categorie: CategorieBoutique;
    }>(`${this.API_URL}`, categorieData)
      .pipe(
        tap(response => {
          console.log('➕ Catégorie créée:', response.categorie.nom);
        })
      );
  }

  /**
   * ✏️ Mettre à jour une catégorie (Admin seulement)
   */
  mettreAJourCategorie(categorieId: string, categorieData: Partial<CategorieBoutique>): Observable<{
    message: string;
    categorie: CategorieBoutique;
  }> {
    return this.http.put<{
      message: string;
      categorie: CategorieBoutique;
    }>(`${this.API_URL}/${categorieId}`, categorieData)
      .pipe(
        tap(response => {
          console.log('✏️ Catégorie mise à jour:', response.categorie.nom);
        })
      );
  }

  /**
   * 🗑️ Supprimer une catégorie (Admin seulement)
   */
  supprimerCategorie(categorieId: string): Observable<{
    message: string;
  }> {
    return this.http.delete<{
      message: string;
    }>(`${this.API_URL}/${categorieId}`)
      .pipe(
        tap(response => {
          console.log('🗑️ Catégorie supprimée:', response.message);
        })
      );
  }

  /**
   * 📊 Obtenir les statistiques des catégories (Admin seulement)
   */
  obtenirStatistiques(): Observable<{
    totalCategories: number;
    categoriesActives: number;
    boutiquesParCategorie: Array<{
      categorie: string;
      nom: string;
      count: number;
    }>;
  }> {
    return this.http.get<any>(`${this.API_URL}/statistiques`)
      .pipe(
        tap(response => {
          console.log('📊 Statistiques catégories récupérées:', response);
        })
      );
  }

  /**
   * 🎨 Obtenir l'icône par défaut d'une catégorie
   */
  getIconeDefaut(nomCategorie: string): string {
    const icones: { [key: string]: string } = {
      'Restaurant': '🍽️',
      'Vêtements': '👗',
      'Électronique': '📱',
      'Beauté': '💄',
      'Sport': '⚽',
      'Librairie': '📚',
      'Bijouterie': '💎',
      'Pharmacie': '💊',
      'Alimentation': '🛒',
      'Mode': '👔',
      'Maison': '🏠',
      'Jouets': '🧸',
      'Automobile': '🚗',
      'Santé': '🏥'
    };
    return icones[nomCategorie] || '🏪';
  }

  /**
   * 🎨 Obtenir la couleur par défaut d'une catégorie
   */
  getCouleurDefaut(nomCategorie: string): string {
    const couleurs: { [key: string]: string } = {
      'Restaurant': '#ff6b6b',
      'Vêtements': '#4ecdc4',
      'Électronique': '#45b7d1',
      'Beauté': '#f093fb',
      'Sport': '#4dabf7',
      'Librairie': '#69db7c',
      'Bijouterie': '#ffd43b',
      'Pharmacie': '#51cf66',
      'Alimentation': '#ff8cc8',
      'Mode': '#845ef7',
      'Maison': '#fd7e14',
      'Jouets': '#20c997',
      'Automobile': '#6c757d',
      'Santé': '#e83e8c'
    };
    return couleurs[nomCategorie] || '#667eea';
  }
}