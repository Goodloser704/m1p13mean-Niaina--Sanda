import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TypeAchatEnum, EtatAchatEnum } from '../utils/enums';

export interface AchatRequest {
  produit: string;
  quantite: number;
  typeAchat: TypeAchatEnum;
  prixUnitaire: number;
}

export interface PanierRequest {
  achats: AchatRequest[];
  montantTotal: number;
}

export interface Achat {
  _id: string;
  acheteur: string;
  produit: {
    _id: string;
    nom: string;
    prix: number;
    boutique: {
      _id: string;
      nom: string;
      commercant: {
        nom: string;
        prenom: string;
      };
    };
  };
  facture: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  typeAchat: {
    type: TypeAchatEnum;
    dateDebut: string;
    dateFin: string;
  };
  etat: EtatAchatEnum;
  createdAt: string;
  updatedAt: string;
}

export interface Facture {
  _id: string;
  acheteur: string;
  description: string;
  montantTotal: number;
  achats: Achat[];
  createdAt: string;
}

export interface AchatResponse {
  message: string;
  facture: Facture;
  achats: Achat[];
  transactions: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AchatService {
  private readonly API_URL = `${environment.apiUrl}/achats`;

  constructor(private http: HttpClient) {}

  /**
   * 🛒 Valider un panier et créer les achats
   */
  validerPanier(panierData: PanierRequest): Observable<AchatResponse> {
    console.log('🛒 Validation panier:', panierData);
    return this.http.post<AchatResponse>(`${this.API_URL}/panier/valider`, panierData)
      .pipe(
        tap(response => {
          console.log('✅ Panier validé:', response);
        })
      );
  }

  /**
   * 📋 Obtenir mes achats en cours
   */
  obtenirMesAchatsEnCours(): Observable<{
    achats: Achat[];
    count: number;
  }> {
    return this.http.get<{
      achats: Achat[];
      count: number;
    }>(`${this.API_URL}/en-cours`)
      .pipe(
        tap(response => {
          console.log('📋 Achats en cours récupérés:', response.count);
        })
      );
  }

  /**
   * 📚 Obtenir mon historique d'achats
   */
  obtenirMonHistoriqueAchats(options: {
    page?: number;
    limit?: number;
    etat?: EtatAchatEnum;
    dateDebut?: string;
    dateFin?: string;
  } = {}): Observable<{
    achats: Achat[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.etat) params.append('etat', options.etat);
    if (options.dateDebut) params.append('dateDebut', options.dateDebut);
    if (options.dateFin) params.append('dateFin', options.dateFin);

    return this.http.get<{
      achats: Achat[];
      pagination: any;
    }>(`${this.API_URL}/historique?${params.toString()}`)
      .pipe(
        tap(response => {
          console.log('📚 Historique achats récupéré:', response.achats.length);
        })
      );
  }

  /**
   * 🔍 Obtenir un achat par ID
   */
  obtenirAchatParId(achatId: string): Observable<{
    achat: Achat;
  }> {
    return this.http.get<{
      achat: Achat;
    }>(`${this.API_URL}/${achatId}`);
  }

  /**
   * ❌ Annuler un achat (si possible)
   */
  annulerAchat(achatId: string, raison?: string): Observable<{
    message: string;
    achat: Achat;
  }> {
    return this.http.put<{
      message: string;
      achat: Achat;
    }>(`${this.API_URL}/${achatId}/annuler`, { raison })
      .pipe(
        tap(response => {
          console.log('❌ Achat annulé:', response.message);
        })
      );
  }

  /**
   * 📋 Obtenir mes factures
   */
  obtenirMesFactures(options: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  } = {}): Observable<{
    factures: Facture[];
    pagination: any;
  }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.dateDebut) params.append('dateDebut', options.dateDebut);
    if (options.dateFin) params.append('dateFin', options.dateFin);

    return this.http.get<{
      factures: Facture[];
      pagination: any;
    }>(`${this.API_URL}/factures?${params.toString()}`)
      .pipe(
        tap(response => {
          console.log('📋 Factures récupérées:', response.factures.length);
        })
      );
  }

  /**
   * 🧾 Obtenir une facture par ID
   */
  obtenirFactureParId(factureId: string): Observable<{
    facture: Facture;
  }> {
    return this.http.get<{
      facture: Facture;
    }>(`${this.API_URL}/factures/${factureId}`);
  }

  /**
   * 📊 Obtenir les statistiques de mes achats
   */
  obtenirStatistiquesAchats(): Observable<{
    totalAchats: number;
    montantTotal: number;
    achatsParEtat: Array<{ etat: EtatAchatEnum; count: number; montant: number }>;
    achatsParMois: Array<{ mois: string; count: number; montant: number }>;
    boutiquesPreferees: Array<{ boutique: string; count: number; montant: number }>;
  }> {
    return this.http.get<any>(`${this.API_URL}/statistiques`)
      .pipe(
        tap(response => {
          console.log('📊 Statistiques achats récupérées:', response);
        })
      );
  }

  /**
   * 🎨 Obtenir l'icône selon l'état de l'achat
   */
  getEtatIcon(etat: EtatAchatEnum): string {
    switch (etat) {
      case EtatAchatEnum.EnAttente: return '⏳';
      case EtatAchatEnum.Validee: return '✅';
      case EtatAchatEnum.Annulee: return '❌';
      default: return '❓';
    }
  }

  /**
   * 🎨 Obtenir la couleur selon l'état de l'achat
   */
  getEtatColor(etat: EtatAchatEnum): string {
    switch (etat) {
      case EtatAchatEnum.EnAttente: return '#ffc107';
      case EtatAchatEnum.Validee: return '#28a745';
      case EtatAchatEnum.Annulee: return '#dc3545';
      default: return '#6c757d';
    }
  }

  /**
   * 🎨 Obtenir l'icône selon le type d'achat
   */
  getTypeAchatIcon(type: TypeAchatEnum): string {
    switch (type) {
      case TypeAchatEnum.Recuperer: return '🚶';
      case TypeAchatEnum.Livrer: return '🚚';
      default: return '🛍️';
    }
  }

  /**
   * 📅 Calculer le temps restant pour un achat
   */
  getTempsRestant(dateFin: string): string {
    const maintenant = new Date();
    const fin = new Date(dateFin);
    const diffMs = fin.getTime() - maintenant.getTime();
    
    if (diffMs <= 0) return 'Prêt';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHeures = Math.floor(diffMs / 3600000);
    const diffJours = Math.floor(diffMs / 86400000);
    
    if (diffJours > 0) return `${diffJours} jour${diffJours > 1 ? 's' : ''}`;
    if (diffHeures > 0) return `${diffHeures}h ${diffMins % 60}min`;
    return `${diffMins} min`;
  }

  /**
   * 💰 Formater un montant
   */
  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }
}