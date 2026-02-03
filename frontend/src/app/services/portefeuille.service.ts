import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TypeTransactionEnum, ModePaiementEnum } from '../utils/enums';

export interface PorteFeuille {
  _id: string;
  balance: number;
  owner: string;
  derniereMiseAJour: string;
  createdAt: string;
  updatedAt: string;
}

export interface PFTransaction {
  _id: string;
  fromWallet: string;
  toWallet: string;
  type: TypeTransactionEnum;
  amount: number;
  description: string;
  statut: string;
  numeroTransaction: string;
  dateExecution: string;
  createdAt: string;
  // Champs enrichis côté frontend
  typeForUser: 'Entrée' | 'Sortie';
  montant: number; // Positif pour entrée, négatif pour sortie
}

export interface TransactionHistorique {
  transactions: PFTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PortefeuilleStats {
  portefeuille: {
    balance: number;
    derniereMiseAJour: string;
  };
  statistiques: {
    periode: string;
    totalEntrees: number;
    totalSorties: number;
    nombreTransactions: number;
    transactionsParType: Array<{
      type: string;
      nombre: number;
      montant: number;
    }>;
  };
}

export interface RechargeRequest {
  montant: number;
  modePaiement?: ModePaiementEnum;
}

export interface RechargeResponse {
  message: string;
  portefeuille: PorteFeuille;
  transaction: {
    montant: number;
    modePaiement: string;
    date: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PortefeuilleService {
  private readonly API_URL = `${environment.apiUrl}/portefeuille`;

  constructor(private http: HttpClient) {}

  /**
   * 💰 Obtenir mon portefeuille
   */
  obtenirMonPortefeuille(): Observable<{ portefeuille: PorteFeuille }> {
    console.log('💰 Récupération portefeuille - URL:', `${this.API_URL}/me`);
    
    return this.http.get<{ portefeuille: PorteFeuille }>(`${this.API_URL}/me`).pipe(
      tap(response => {
        console.log('✅ Portefeuille récupéré:', response.portefeuille.balance + '€');
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération portefeuille:', error);
        }
      })
    );
  }

  /**
   * 📊 Obtenir l'historique de mes transactions
   */
  obtenirMesTransactions(options: {
    page?: number;
    limit?: number;
    type?: TypeTransactionEnum;
  } = {}): Observable<TransactionHistorique> {
    const { page = 1, limit = 20, type } = options;
    
    let params = `?page=${page}&limit=${limit}`;
    if (type) {
      params += `&type=${type}`;
    }
    
    console.log('📊 Récupération transactions - URL:', `${this.API_URL}/transactions${params}`);
    
    return this.http.get<TransactionHistorique>(`${this.API_URL}/transactions${params}`).pipe(
      tap(response => {
        console.log('✅ Transactions récupérées:', response.transactions.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération transactions:', error);
        }
      })
    );
  }

  /**
   * 💳 Recharger le portefeuille
   */
  rechargerPortefeuille(rechargeData: RechargeRequest): Observable<RechargeResponse> {
    console.log('💳 Recharge portefeuille:', rechargeData);
    
    return this.http.post<RechargeResponse>(`${this.API_URL}/recharge`, rechargeData).pipe(
      tap(response => {
        console.log('✅ Portefeuille rechargé:', response.transaction.montant + '€');
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur recharge portefeuille:', error);
        }
      })
    );
  }

  /**
   * 📈 Obtenir les statistiques du portefeuille
   */
  obtenirStatistiques(): Observable<PortefeuilleStats> {
    console.log('📈 Récupération statistiques - URL:', `${this.API_URL}/stats`);
    
    return this.http.get<PortefeuilleStats>(`${this.API_URL}/stats`).pipe(
      tap(response => {
        console.log('✅ Statistiques récupérées:', response.statistiques.nombreTransactions + ' transactions');
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération statistiques:', error);
        }
      })
    );
  }

  /**
   * 👨‍💼 Obtenir tous les portefeuilles (Admin seulement)
   */
  obtenirTousPortefeuilles(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Observable<{
    portefeuilles: Array<PorteFeuille & { owner: any }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, search } = options;
    
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    
    console.log('👨‍💼 Récupération tous portefeuilles - URL:', `${this.API_URL}/admin/all${params}`);
    
    return this.http.get<{
      portefeuilles: Array<PorteFeuille & { owner: any }>;
      pagination: any;
    }>(`${this.API_URL}/admin/all${params}`).pipe(
      tap(response => {
        console.log('✅ Tous portefeuilles récupérés:', response.portefeuilles.length);
      }),
      tap({
        error: (error) => {
          console.error('❌ Erreur récupération tous portefeuilles:', error);
        }
      })
    );
  }

  /**
   * 🎨 Obtenir l'icône du type de transaction
   */
  getTransactionIcon(type: TypeTransactionEnum): string {
    switch (type) {
      case TypeTransactionEnum.Achat: return '🛒';
      case TypeTransactionEnum.Loyer: return '🏠';
      case TypeTransactionEnum.Commission: return '💰';
      default: return '💳';
    }
  }

  /**
   * 🎨 Obtenir la couleur du type de transaction
   */
  getTransactionColor(typeForUser: 'Entrée' | 'Sortie'): string {
    switch (typeForUser) {
      case 'Entrée': return '#28a745'; // Vert
      case 'Sortie': return '#dc3545'; // Rouge
      default: return '#6c757d'; // Gris
    }
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
   * 📅 Formater une date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 📊 Calculer le pourcentage d'une transaction par rapport au total
   */
  calculatePercentage(montant: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((Math.abs(montant) / total) * 100);
  }

  /**
   * 🔍 Filtrer les transactions par type
   */
  filterTransactionsByType(transactions: PFTransaction[], type: TypeTransactionEnum): PFTransaction[] {
    return transactions.filter(t => t.type === type);
  }

  /**
   * 📈 Calculer le solde à une date donnée
   */
  calculateBalanceAtDate(transactions: PFTransaction[], targetDate: Date): number {
    return transactions
      .filter(t => new Date(t.createdAt) <= targetDate)
      .reduce((balance, t) => balance + t.montant, 0);
  }

  /**
   * 🎯 Obtenir les transactions récentes (7 derniers jours)
   */
  getRecentTransactions(transactions: PFTransaction[]): PFTransaction[] {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return transactions.filter(t => new Date(t.createdAt) >= sevenDaysAgo);
  }

  /**
   * 📊 Grouper les transactions par mois
   */
  groupTransactionsByMonth(transactions: PFTransaction[]): { [key: string]: PFTransaction[] } {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
      
      return groups;
    }, {} as { [key: string]: PFTransaction[] });
  }
}