import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TypeAchatEnum } from '../utils/enums';

export interface Produit {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  stock: {
    nombreDispo: number;
    nombreReserve: number;
    seuilAlerte: number;
  };
  typeProduit: {
    _id: string;
    nom: string;
  };
  boutique: {
    _id: string;
    nom: string;
    proprietaire: string;
  };
  dureePreparation: number;
  typeAchat: TypeAchatEnum[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypeProduit {
  _id: string;
  nom: string;
  description: string;
  boutique: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduitRequest {
  nom: string;
  description?: string;
  prix: number;
  stock: {
    nombreDispo: number;
    nombreReserve?: number;
    seuilAlerte: number;
  };
  typeProduit?: string;
  dureePreparation: number;
  typeAchat: TypeAchatEnum[];
  isActive?: boolean;
}

export interface UpdateProduitRequest extends Partial<CreateProduitRequest> {
  _id: string;
}

export interface CreateTypeProduitRequest {
  nom: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTypeProduitRequest extends Partial<CreateTypeProduitRequest> {
  _id: string;
}

export interface ProduitsResponse {
  produits: Produit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TypesProduitsResponse {
  typesProduit: TypeProduit[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private readonly API_URL = `${environment.apiUrl}/produits`;
  private readonly TYPES_API_URL = `${environment.apiUrl}/types-produit`;

  constructor(private http: HttpClient) {}

  // ===== GESTION DES PRODUITS =====

  /**
   * 📦 Obtenir tous les produits (avec pagination et filtres)
   */
  obtenirProduits(options: {
    page?: number;
    limit?: number;
    search?: string;
    boutiqueId?: string;
    typeId?: string;
    stockMin?: number;
  } = {}): Observable<ProduitsResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.boutiqueId) params = params.set('boutiqueId', options.boutiqueId);
    if (options.typeId) params = params.set('typeId', options.typeId);
    if (options.stockMin !== undefined) params = params.set('stockMin', options.stockMin.toString());

    console.log('📦 Récupération produits - URL:', `${this.API_URL}`, 'Params:', params.toString());
    
    return this.http.get<ProduitsResponse>(this.API_URL, { params }).pipe(
      tap(response => {
        console.log('✅ Produits récupérés:', response.produits.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération produits:', error);
        }
      })
    );
  }

  /**
   * 🏪 Obtenir les produits d'une boutique
   */
  obtenirProduitsParBoutique(boutiqueId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    typeId?: string;
  } = {}): Observable<ProduitsResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.typeId) params = params.set('typeId', options.typeId);

    console.log('🏪 Récupération produits boutique - URL:', `${this.API_URL}/boutique/${boutiqueId}`);
    
    return this.http.get<ProduitsResponse>(`${this.API_URL}/boutique/${boutiqueId}`, { params }).pipe(
      tap(response => {
        console.log('✅ Produits boutique récupérés:', response.produits.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération produits boutique:', error);
        }
      })
    );
  }

  /**
   * 🔍 Obtenir un produit par ID
   */
  obtenirProduitParId(id: string): Observable<{ produit: Produit }> {
    console.log('🔍 Récupération produit - URL:', `${this.API_URL}/${id}`);
    
    return this.http.get<{ produit: Produit }>(`${this.API_URL}/${id}`).pipe(
      tap(response => {
        console.log('✅ Produit récupéré:', response.produit.nom);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération produit:', error);
        }
      })
    );
  }

  /**
   * ➕ Créer un nouveau produit
   */
  creerProduit(produitData: CreateProduitRequest): Observable<{ message: string; produit: Produit }> {
    console.log('➕ Création produit:', produitData);
    
    return this.http.post<{ message: string; produit: Produit }>(this.API_URL, produitData).pipe(
      tap(response => {
        console.log('✅ Produit créé:', response.produit.nom);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur création produit:', error);
        }
      })
    );
  }

  /**
   * ✏️ Mettre à jour un produit
   */
  mettreAJourProduit(id: string, produitData: Partial<CreateProduitRequest>): Observable<{ message: string; produit: Produit }> {
    console.log('✏️ Mise à jour produit:', id, produitData);
    
    return this.http.put<{ message: string; produit: Produit }>(`${this.API_URL}/${id}`, produitData).pipe(
      tap(response => {
        console.log('✅ Produit mis à jour:', response.produit.nom);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur mise à jour produit:', error);
        }
      })
    );
  }

  /**
   * 🗑️ Supprimer un produit
   */
  supprimerProduit(id: string): Observable<{ message: string }> {
    console.log('🗑️ Suppression produit:', id);
    
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`).pipe(
      tap(response => {
        console.log('✅ Produit supprimé:', response.message);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur suppression produit:', error);
        }
      })
    );
  }

  /**
   * 📦 Mettre à jour le stock d'un produit
   */
  mettreAJourStock(id: string, stockData: {
    operation: 'ajouter' | 'retirer' | 'definir';
    quantite: number;
  }): Observable<{ message: string; produit: Produit }> {
    console.log('📦 Mise à jour stock:', id, stockData);
    
    return this.http.put<{ message: string; produit: Produit }>(`${this.API_URL}/${id}/stock`, stockData).pipe(
      tap(response => {
        console.log('✅ Stock mis à jour:', response.produit.stock.nombreDispo);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur mise à jour stock:', error);
        }
      })
    );
  }

  /**
   * 🔍 Rechercher des produits
   */
  rechercherProduits(terme: string, options: {
    page?: number;
    limit?: number;
    boutiqueId?: string;
  } = {}): Observable<ProduitsResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.boutiqueId) params = params.set('boutiqueId', options.boutiqueId);

    console.log('🔍 Recherche produits - URL:', `${this.API_URL}/search/${terme}`);
    
    return this.http.get<ProduitsResponse>(`${this.API_URL}/search/${terme}`, { params }).pipe(
      tap(response => {
        console.log('✅ Produits trouvés:', response.produits.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur recherche produits:', error);
        }
      })
    );
  }

  // ===== GESTION DES TYPES DE PRODUITS =====

  /**
   * 🏷️ Obtenir tous les types de produits
   */
  obtenirTypesProduits(options: {
    page?: number;
    limit?: number;
    boutiqueId?: string;
  } = {}): Observable<TypesProduitsResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.boutiqueId) params = params.set('boutiqueId', options.boutiqueId);

    console.log('🏷️ Récupération types produits - URL:', this.TYPES_API_URL);
    
    return this.http.get<TypesProduitsResponse>(this.TYPES_API_URL, { params }).pipe(
      tap(response => {
        console.log('✅ Types produits récupérés:', response.typesProduit.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération types produits:', error);
        }
      })
    );
  }

  /**
   * 🏪 Obtenir les types de produits d'une boutique
   */
  obtenirTypesParBoutique(boutiqueId: string): Observable<TypesProduitsResponse> {
    console.log('🏪 Récupération types boutique - URL:', `${this.TYPES_API_URL}/boutique/${boutiqueId}`);
    
    return this.http.get<TypesProduitsResponse>(`${this.TYPES_API_URL}/boutique/${boutiqueId}`).pipe(
      tap(response => {
        console.log('✅ Types boutique récupérés:', response.typesProduit.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération types boutique:', error);
        }
      })
    );
  }

  /**
   * 🔍 Obtenir un type de produit par ID
   */
  obtenirTypeProduitParId(id: string): Observable<{ typeProduit: TypeProduit }> {
    console.log('🔍 Récupération type produit - URL:', `${this.TYPES_API_URL}/${id}`);
    
    return this.http.get<{ typeProduit: TypeProduit }>(`${this.TYPES_API_URL}/${id}`).pipe(
      tap(response => {
        console.log('✅ Type produit récupéré:', response.typeProduit.nom);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération type produit:', error);
        }
      })
    );
  }

  /**
   * ➕ Créer un nouveau type de produit
   */
  creerTypeProduit(typeData: CreateTypeProduitRequest): Observable<{ message: string; typeProduit: TypeProduit }> {
    console.log('➕ Création type produit:', typeData);
    
    return this.http.post<{ message: string; typeProduit: TypeProduit }>(this.TYPES_API_URL, typeData).pipe(
      tap(response => {
        console.log('✅ Type produit créé:', response.typeProduit.nom);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur création type produit:', error);
        }
      })
    );
  }

  /**
   * ✏️ Mettre à jour un type de produit
   */
  mettreAJourTypeProduit(id: string, typeData: Partial<CreateTypeProduitRequest>): Observable<{ message: string; typeProduit: TypeProduit }> {
    console.log('✏️ Mise à jour type produit:', id, typeData);
    
    return this.http.put<{ message: string; typeProduit: TypeProduit }>(`${this.TYPES_API_URL}/${id}`, typeData).pipe(
      tap(response => {
        console.log('✅ Type produit mis à jour:', response.typeProduit.nom);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur mise à jour type produit:', error);
        }
      })
    );
  }

  /**
   * 🗑️ Supprimer un type de produit
   */
  supprimerTypeProduit(id: string): Observable<{ message: string }> {
    console.log('🗑️ Suppression type produit:', id);
    
    return this.http.delete<{ message: string }>(`${this.TYPES_API_URL}/${id}`).pipe(
      tap(response => {
        console.log('✅ Type produit supprimé:', response.message);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur suppression type produit:', error);
        }
      })
    );
  }

  // ===== UTILITAIRES =====

  /**
   * 📊 Vérifier si un produit est en stock
   */
  estEnStock(produit: Produit): boolean {
    return produit.stock.nombreDispo > 0;
  }

  /**
   * ⚠️ Vérifier si un produit est en stock faible
   */
  estStockFaible(produit: Produit): boolean {
    return produit.stock.nombreDispo <= produit.stock.seuilAlerte && produit.stock.nombreDispo > 0;
  }

  /**
   * 🚫 Vérifier si un produit est en rupture
   */
  estEnRupture(produit: Produit): boolean {
    return produit.stock.nombreDispo === 0;
  }

  /**
   * 🎨 Obtenir la classe CSS pour le statut du stock
   */
  getClasseStock(produit: Produit): string {
    if (this.estEnRupture(produit)) return 'text-danger';
    if (this.estStockFaible(produit)) return 'text-warning';
    return 'text-success';
  }

  /**
   * 📈 Calculer le pourcentage de stock restant
   */
  getPourcentageStock(produit: Produit): number {
    const stockTotal = produit.stock.nombreDispo + produit.stock.nombreReserve;
    if (stockTotal === 0) return 0;
    return Math.round((produit.stock.nombreDispo / stockTotal) * 100);
  }

  /**
   * 💰 Formater le prix
   */
  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(prix);
  }

  /**
   * ⏱️ Formater la durée de préparation
   */
  formatDureePreparation(duree: number): string {
    if (duree < 60) {
      return `${duree} min`;
    }
    const heures = Math.floor(duree / 60);
    const minutes = duree % 60;
    return `${heures}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  }

  /**
   * 🎯 Filtrer les produits disponibles
   */
  filtrerProduitsDisponibles(produits: Produit[]): Produit[] {
    return produits.filter(p => p.isActive && this.estEnStock(p));
  }

  /**
   * 🔍 Rechercher dans une liste de produits
   */
  rechercherDansListe(produits: Produit[], terme: string): Produit[] {
    const termeNormalise = terme.toLowerCase().trim();
    if (!termeNormalise) return produits;
    
    return produits.filter(produit => 
      produit.nom.toLowerCase().includes(termeNormalise) ||
      produit.description.toLowerCase().includes(termeNormalise) ||
      produit.typeProduit?.nom.toLowerCase().includes(termeNormalise)
    );
  }
}