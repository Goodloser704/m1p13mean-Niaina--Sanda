import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BoutiqueRegistration {
  nom: string;
  description?: string;
  categorie: 'Mode' | 'Électronique' | 'Alimentation' | 'Beauté' | 'Sport' | 'Maison' | 'Autre';
  emplacement?: {
    zone?: string;
    numeroLocal?: string;
    etage?: number;
  };
  contact?: {
    telephone?: string;
    email?: string;
    siteWeb?: string;
  };
  horaires?: Record<string, { ouverture?: string; fermeture?: string }>;
  images?: string[];
  logo?: string;
}

export interface Boutique extends BoutiqueRegistration {
  _id: string;
  proprietaire: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  statut: 'en_attente' | 'approuve' | 'suspendu';
  note: {
    moyenne: number;
    nombreAvis: number;
  };
  dateCreation: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private readonly API_URL = `${environment.apiUrl}/boutique`;

  constructor(private http: HttpClient) {}

  /**
   * 📝 Créer une nouvelle inscription boutique
   */
  registerBoutique(boutiqueData: BoutiqueRegistration): Observable<{
    message: string;
    boutique: Partial<Boutique>;
  }> {
    console.log('🏪 Création boutique:', boutiqueData);
    return this.http.post<{
      message: string;
      boutique: Partial<Boutique>;
    }>(`${this.API_URL}/register`, boutiqueData);
  }

  /**
   * 🏪 Obtenir toutes mes boutiques
   */
  getMyBoutiques(): Observable<{ 
    boutiques: Boutique[]; 
    count: number; 
  }> {
    console.log('🏪 Récupération mes boutiques - URL:', `${this.API_URL}/my-boutiques`);
    
    return this.http.get<{ 
      boutiques: Boutique[]; 
      count: number; 
    }>(`${this.API_URL}/my-boutiques`).pipe(
      tap(response => {
        console.log('✅ Mes boutiques récupérées:', response.boutiques.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération mes boutiques:', error);
        }
      })
    );
  }

  /**
   * 🏪 Obtenir une boutique spécifique
   */
  getMyBoutique(boutiqueId?: string): Observable<{ boutique: Boutique }> {
    const url = boutiqueId 
      ? `${this.API_URL}/me/${boutiqueId}`
      : `${this.API_URL}/me`;
    console.log('🏪 Récupération boutique spécifique - URL:', url);
    return this.http.get<{ boutique: Boutique }>(url);
  }

  /**
   * ✏️ Mettre à jour une boutique
   */
  updateBoutique(boutiqueId: string, boutiqueData: Partial<BoutiqueRegistration>): Observable<{
    message: string;
    boutique: Boutique;
  }> {
    console.log('🏪 Mise à jour boutique:', boutiqueId, boutiqueData);
    return this.http.put<{
      message: string;
      boutique: Boutique;
    }>(`${this.API_URL}/me/${boutiqueId}`, boutiqueData);
  }

  /**
   * 🗑️ Supprimer une boutique
   */
  deleteBoutique(boutiqueId: string): Observable<{
    message: string;
  }> {
    console.log('🏪 Suppression boutique:', boutiqueId);
    return this.http.delete<{
      message: string;
    }>(`${this.API_URL}/me/${boutiqueId}`);
  }

  /**
   * 📋 Obtenir les boutiques en attente (Admin seulement)
   */
  getPendingBoutiques(): Observable<{
    boutiques: Boutique[];
    count: number;
  }> {
    console.log('🏪 Récupération boutiques en attente - URL:', `${this.API_URL}/pending`);
    return this.http.get<{
      boutiques: Boutique[];
      count: number;
    }>(`${this.API_URL}/pending`);
  }

  /**
   * ✅ Approuver une boutique (Admin seulement)
   */
  approveBoutique(boutiqueId: string): Observable<{
    message: string;
    boutique: Boutique;
  }> {
    console.log('🏪 Approbation boutique:', boutiqueId);
    return this.http.put<{
      message: string;
      boutique: Boutique;
    }>(`${this.API_URL}/${boutiqueId}/approve`, {});
  }

  /**
   * ❌ Rejeter une boutique (Admin seulement)
   */
  rejectBoutique(boutiqueId: string, reason?: string): Observable<{
    message: string;
    reason?: string;
  }> {
    console.log('🏪 Rejet boutique:', boutiqueId, reason);
    return this.http.put<{
      message: string;
      reason?: string;
    }>(`${this.API_URL}/${boutiqueId}/reject`, { reason });
  }

  /**
   * 🔍 Obtenir une boutique par ID (Admin seulement)
   */
  getBoutiqueById(boutiqueId: string): Observable<{ boutique: Boutique }> {
    console.log('🏪 Récupération boutique par ID:', boutiqueId);
    return this.http.get<{ boutique: Boutique }>(`${this.API_URL}/${boutiqueId}`);
  }

  /**
   * 📊 Obtenir les statistiques des boutiques (Admin seulement)
   */
  getBoutiqueStats(): Observable<{
    parStatut: Array<{ _id: string; count: number }>;
    total: number;
    parCategorie: Array<{ _id: string; count: number }>;
  }> {
    console.log('🏪 Récupération statistiques boutiques - URL:', `${this.API_URL}/admin/stats`);
    return this.http.get<{
      parStatut: Array<{ _id: string; count: number }>;
      total: number;
      parCategorie: Array<{ _id: string; count: number }>;
    }>(`${this.API_URL}/admin/stats`);
  }

  /**
   * 🏪 Obtenir toutes les boutiques (Admin seulement)
   */
  obtenirBoutiques(): Observable<{
    boutiques: Boutique[];
    count: number;
  }> {
    console.log('🏪 Récupération toutes boutiques - URL:', `${this.API_URL}/all`);
    return this.http.get<{
      boutiques: Boutique[];
      count: number;
    }>(`${this.API_URL}/all`);
  }

  /**
   * 🎨 Obtenir l'icône de la catégorie
   */
  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Mode': return '👗';
      case 'Électronique': return '📱';
      case 'Alimentation': return '🍕';
      case 'Beauté': return '💄';
      case 'Sport': return '⚽';
      case 'Maison': return '🏠';
      case 'Autre': return '🏪';
      default: return '🏪';
    }
  }

  /**
   * 🎨 Obtenir la couleur du statut
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'en_attente': return '#ffc107';
      case 'approuve': return '#28a745';
      case 'suspendu': return '#dc3545';
      default: return '#6c757d';
    }
  }

  /**
   * 📅 Formater les horaires pour l'affichage
   */
  formatHoraires(horaires: any): string {
    if (!horaires) return 'Non renseigné';
    
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const horairesList = jours
      .filter(jour => horaires[jour]?.ouverture && horaires[jour]?.fermeture)
      .map(jour => `${jour}: ${horaires[jour].ouverture}-${horaires[jour].fermeture}`);
    
    return horairesList.length > 0 ? horairesList.join(', ') : 'Non renseigné';
  }
}