import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EtatDemandeEnum } from '../utils/enums';

export interface DemandeLocationRequest {
  boutiqueId: string;
  espaceId: string;
  dateDebutSouhaitee: string;
  dureeContrat: number;
  messageCommercant?: string;
}

export interface ContratInfo {
  dateDebut: string;
  dateFin: string;
  loyerMensuel?: number;
  caution?: number;
  conditionsSpeciales?: string;
}

export interface AccepterDemandeRequest extends ContratInfo {
  messageAdmin?: string;
}

export interface RefuserDemandeRequest {
  raisonRefus: string;
  messageAdmin?: string;
}

export interface DemandeLocation {
  _id: string;
  boutique: {
    _id: string;
    nom: string;
    commercant?: {
      _id: string;
      nom: string;
      prenoms: string;
      email: string;
    };
    proprietaire?: {
      _id: string;
      nom: string;
      prenoms: string;
      email: string;
    };
  };
  espace: {
    _id: string;
    codeEspace: string;
    surface: number;
    loyer: number;
    etage: number;
  };
  etatDemande: EtatDemandeEnum;
  dateDebutSouhaitee: string;
  dureeContrat: number;
  messageCommercant?: string;
  dateReponse?: string;
  adminRepondant?: {
    _id: string;
    nom: string;
    prenoms: string;
  };
  messageAdmin?: string;
  raisonRefus?: string;
  contrat?: ContratInfo;
  createdAt: string;
  updatedAt: string;
}

export interface DemandesResponse {
  demandes: DemandeLocation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DemandeLocationService {
  private readonly API_URL = `${environment.apiUrl}/demandes-location`;

  constructor(private http: HttpClient) {}

  /**
   * 📝 Créer une demande de location
   */
  creerDemande(demandeData: DemandeLocationRequest): Observable<{
    message: string;
    demande: DemandeLocation;
  }> {
    console.log('📝 Création demande de location:', demandeData);
    
    return this.http.post<{
      message: string;
      demande: DemandeLocation;
    }>(`${this.API_URL}`, demandeData).pipe(
      tap(response => {
        console.log('✅ Demande créée:', response.demande._id);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur création demande:', error);
        }
      })
    );
  }

  /**
   * 📋 Obtenir mes demandes de location (Commercant)
   */
  obtenirMesDemandes(options: {
    page?: number;
    limit?: number;
    etat?: EtatDemandeEnum;
  } = {}): Observable<DemandesResponse> {
    const { page = 1, limit = 20, etat } = options;
    
    let params = `?page=${page}&limit=${limit}`;
    if (etat) {
      params += `&etat=${etat}`;
    }
    
    console.log('📋 Récupération mes demandes - URL:', `${this.API_URL}/me${params}`);
    
    return this.http.get<DemandesResponse>(`${this.API_URL}/me${params}`).pipe(
      tap(response => {
        console.log('✅ Mes demandes récupérées:', response.demandes.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération mes demandes:', error);
        }
      })
    );
  }

  /**
   * 👨‍💼 Obtenir toutes les demandes (Admin)
   */
  obtenirToutesDemandes(options: {
    page?: number;
    limit?: number;
    etat?: EtatDemandeEnum;
    search?: string;
  } = {}): Observable<DemandesResponse> {
    const { page = 1, limit = 20, etat, search } = options;
    
    let params = `?page=${page}&limit=${limit}`;
    if (etat) {
      params += `&etat=${etat}`;
    }
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    
    console.log('👨‍💼 Récupération toutes demandes - URL:', `${this.API_URL}${params}`);
    
    return this.http.get<DemandesResponse>(`${this.API_URL}${params}`).pipe(
      tap(response => {
        console.log('✅ Toutes demandes récupérées:', response.demandes.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération toutes demandes:', error);
        }
      })
    );
  }

  /**
   * 🔍 Obtenir une demande par ID
   */
  obtenirDemandeParId(id: string): Observable<{ demande: DemandeLocation }> {
    console.log('🔍 Récupération demande par ID:', id);
    
    return this.http.get<{ demande: DemandeLocation }>(`${this.API_URL}/${id}`).pipe(
      tap(response => {
        console.log('✅ Demande récupérée:', response.demande._id);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération demande:', error);
        }
      })
    );
  }

  /**
   * ✅ Accepter une demande de location (Admin)
   */
  accepterDemande(id: string, acceptationData: AccepterDemandeRequest): Observable<{
    message: string;
    demande: DemandeLocation;
  }> {
    console.log('✅ Acceptation demande:', id, acceptationData);
    
    return this.http.put<{
      message: string;
      demande: DemandeLocation;
    }>(`${this.API_URL}/${id}/accepter`, acceptationData).pipe(
      tap(response => {
        console.log('✅ Demande acceptée:', response.demande._id);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur acceptation demande:', error);
        }
      })
    );
  }

  /**
   * ❌ Refuser une demande de location (Admin)
   */
  refuserDemande(id: string, refusData: RefuserDemandeRequest): Observable<{
    message: string;
    demande: DemandeLocation;
  }> {
    console.log('❌ Refus demande:', id, refusData);
    
    return this.http.put<{
      message: string;
      demande: DemandeLocation;
    }>(`${this.API_URL}/${id}/refuser`, refusData).pipe(
      tap(response => {
        console.log('✅ Demande refusée:', response.demande._id);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur refus demande:', error);
        }
      })
    );
  }

  /**
   * 🗑️ Annuler une demande (Commercant)
   */
  annulerDemande(id: string): Observable<{ message: string }> {
    console.log('🗑️ Annulation demande:', id);
    
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`).pipe(
      tap(response => {
        console.log('✅ Demande annulée:', response.message);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur annulation demande:', error);
        }
      })
    );
  }

  /**
   * 🎨 Obtenir l'icône de l'état de la demande
   */
  getEtatIcon(etat: EtatDemandeEnum): string {
    switch (etat) {
      case EtatDemandeEnum.EnAttente: return '⏳';
      case EtatDemandeEnum.Acceptee: return '✅';
      case EtatDemandeEnum.Refusee: return '❌';
      default: return '❓';
    }
  }

  /**
   * 🎨 Obtenir la couleur de l'état de la demande
   */
  getEtatColor(etat: EtatDemandeEnum): string {
    switch (etat) {
      case EtatDemandeEnum.EnAttente: return '#ffc107'; // Jaune
      case EtatDemandeEnum.Acceptee: return '#28a745'; // Vert
      case EtatDemandeEnum.Refusee: return '#dc3545'; // Rouge
      default: return '#6c757d'; // Gris
    }
  }

  /**
   * 🎨 Obtenir le libellé de l'état
   */
  getEtatLabel(etat: EtatDemandeEnum): string {
    switch (etat) {
      case EtatDemandeEnum.EnAttente: return 'En attente';
      case EtatDemandeEnum.Acceptee: return 'Acceptée';
      case EtatDemandeEnum.Refusee: return 'Refusée';
      default: return 'Inconnu';
    }
  }

  /**
   * 📅 Formater une date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * 📅 Formater une date avec heure
   */
  formatDateTime(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 💰 Formater un montant en euros
   */
  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  /**
   * 📊 Calculer le coût total du contrat
   */
  calculateCoutTotal(loyer: number, dureeContrat: number, caution: number = 0): number {
    return (loyer * dureeContrat) + caution;
  }

  /**
   * 📈 Calculer le coût mensuel moyen
   */
  calculateCoutMensuelMoyen(coutTotal: number, dureeContrat: number): number {
    return dureeContrat > 0 ? coutTotal / dureeContrat : 0;
  }

  /**
   * 🔍 Filtrer les demandes par état
   */
  filterDemandesByEtat(demandes: DemandeLocation[], etat: EtatDemandeEnum): DemandeLocation[] {
    return demandes.filter(d => d.etatDemande === etat);
  }

  /**
   * 📊 Obtenir les statistiques des demandes
   */
  getDemandesStats(demandes: DemandeLocation[]): {
    total: number;
    enAttente: number;
    acceptees: number;
    refusees: number;
    pourcentageAcceptation: number;
  } {
    const total = demandes.length;
    const enAttente = demandes.filter(d => d.etatDemande === EtatDemandeEnum.EnAttente).length;
    const acceptees = demandes.filter(d => d.etatDemande === EtatDemandeEnum.Acceptee).length;
    const refusees = demandes.filter(d => d.etatDemande === EtatDemandeEnum.Refusee).length;
    
    const demandesTraitees = acceptees + refusees;
    const pourcentageAcceptation = demandesTraitees > 0 ? Math.round((acceptees / demandesTraitees) * 100) : 0;
    
    return {
      total,
      enAttente,
      acceptees,
      refusees,
      pourcentageAcceptation
    };
  }

  /**
   * ⏰ Vérifier si une demande est récente (moins de 24h)
   */
  isDemandeRecente(demande: DemandeLocation): boolean {
    const maintenant = new Date();
    const dateCreation = new Date(demande.createdAt);
    const diffHeures = (maintenant.getTime() - dateCreation.getTime()) / (1000 * 60 * 60);
    
    return diffHeures < 24;
  }

  /**
   * ⚠️ Vérifier si une demande est urgente (en attente depuis plus de 7 jours)
   */
  isDemandeUrgente(demande: DemandeLocation): boolean {
    if (demande.etatDemande !== EtatDemandeEnum.EnAttente) {
      return false;
    }
    
    const maintenant = new Date();
    const dateCreation = new Date(demande.createdAt);
    const diffJours = (maintenant.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24);
    
    return diffJours > 7;
  }
}