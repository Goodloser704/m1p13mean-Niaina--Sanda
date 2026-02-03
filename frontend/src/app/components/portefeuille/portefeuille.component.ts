import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortefeuilleService, PorteFeuille, PFTransaction, PortefeuilleStats } from '../../services/portefeuille.service';
import { AuthService } from '../../services/auth.service';
import { TypeTransactionEnum, ModePaiementEnum } from '../../utils/enums';

@Component({
  selector: 'app-portefeuille',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="portefeuille-container">
      <!-- En-tête avec balance -->
      <div class="balance-card" *ngIf="portefeuille">
        <div class="balance-header">
          <h2>💰 Mon Portefeuille</h2>
          <div class="balance-amount">
            {{ portefeuilleService.formatMontant(portefeuille.balance) }}
          </div>
        </div>
        <div class="balance-info">
          <small>Dernière mise à jour : {{ portefeuilleService.formatDate(portefeuille.derniereMiseAJour) }}</small>
        </div>
        <div class="balance-actions">
          <button class="btn btn-primary" (click)="showRechargeModal = true">
            💳 Recharger
          </button>
          <button class="btn btn-secondary" (click)="loadStats()">
            📊 Statistiques
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-section" *ngIf="stats">
        <h3>📈 Statistiques ({{ stats.statistiques.periode }})</h3>
        <div class="stats-grid">
          <div class="stat-card positive">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-value">{{ portefeuilleService.formatMontant(stats.statistiques.totalEntrees) }}</div>
              <div class="stat-label">Entrées</div>
            </div>
          </div>
          <div class="stat-card negative">
            <div class="stat-icon">📉</div>
            <div class="stat-content">
              <div class="stat-value">{{ portefeuilleService.formatMontant(stats.statistiques.totalSorties) }}</div>
              <div class="stat-label">Sorties</div>
            </div>
          </div>
          <div class="stat-card neutral">
            <div class="stat-icon">🔄</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.statistiques.nombreTransactions }}</div>
              <div class="stat-label">Transactions</div>
            </div>
          </div>
        </div>

        <!-- Transactions par type -->
        <div class="transactions-by-type" *ngIf="stats.statistiques.transactionsParType.length > 0">
          <h4>Répartition par type</h4>
          <div class="type-list">
            <div class="type-item" *ngFor="let typeStats of stats.statistiques.transactionsParType">
              <span class="type-icon">{{ getTransactionIcon(typeStats.type) }}</span>
              <span class="type-name">{{ typeStats.type }}</span>
              <span class="type-count">{{ typeStats.nombre }} transactions</span>
              <span class="type-amount">{{ portefeuilleService.formatMontant(typeStats.montant) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres des transactions -->
      <div class="filters-section">
        <h3>📊 Historique des Transactions</h3>
        <div class="filters">
          <select [(ngModel)]="selectedType" (change)="loadTransactions()" class="form-select">
            <option value="">Tous les types</option>
            <option [value]="TypeTransactionEnum.Achat">🛒 Achats</option>
            <option [value]="TypeTransactionEnum.Loyer">🏠 Loyers</option>
            <option [value]="TypeTransactionEnum.Commission">💰 Commissions</option>
          </select>
          <button class="btn btn-outline-primary" (click)="loadTransactions()">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <!-- Liste des transactions -->
      <div class="transactions-section" *ngIf="transactions.length > 0">
        <div class="transaction-item" 
             *ngFor="let transaction of transactions"
             [class.positive]="transaction.typeForUser === 'Entrée'"
             [class.negative]="transaction.typeForUser === 'Sortie'">
          <div class="transaction-icon">
            {{ portefeuilleService.getTransactionIcon(transaction.type) }}
          </div>
          <div class="transaction-content">
            <div class="transaction-header">
              <span class="transaction-type">{{ transaction.type }}</span>
              <span class="transaction-amount" 
                    [style.color]="portefeuilleService.getTransactionColor(transaction.typeForUser)">
                {{ transaction.typeForUser === 'Entrée' ? '+' : '-' }}{{ formatMontant(this.abs(transaction.montant)) }}
              </span>
            </div>
            <div class="transaction-description">{{ transaction.description }}</div>
            <div class="transaction-meta">
              <span class="transaction-date">{{ portefeuilleService.formatDate(transaction.createdAt) }}</span>
              <span class="transaction-number">#{{ transaction.numeroTransaction }}</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination.totalPages > 1">
          <button class="btn btn-outline-primary" 
                  [disabled]="pagination.page <= 1"
                  (click)="changePage(pagination.page - 1)">
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ pagination.page }} sur {{ pagination.totalPages }}
          </span>
          <button class="btn btn-outline-primary" 
                  [disabled]="pagination.page >= pagination.totalPages"
                  (click)="changePage(pagination.page + 1)">
            Suivant →
          </button>
        </div>
      </div>

      <!-- Message si pas de transactions -->
      <div class="no-transactions" *ngIf="transactions.length === 0 && !loading">
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <h4>Aucune transaction</h4>
          <p>Vous n'avez pas encore effectué de transactions.</p>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Modal de recharge -->
      <div class="modal" *ngIf="showRechargeModal" (click)="closeRechargeModal($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>💳 Recharger le Portefeuille</h3>
            <button class="close-btn" (click)="showRechargeModal = false">×</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="recharger()" #rechargeForm="ngForm">
              <div class="form-group">
                <label for="montant">Montant à recharger</label>
                <input type="number" 
                       id="montant"
                       [(ngModel)]="rechargeData.montant" 
                       name="montant"
                       class="form-control"
                       min="0.01" 
                       max="10000" 
                       step="0.01"
                       required>
                <small class="form-text">Entre 0,01€ et 10 000€</small>
              </div>
              <div class="form-group">
                <label for="modePaiement">Mode de paiement</label>
                <select id="modePaiement" 
                        [(ngModel)]="rechargeData.modePaiement" 
                        name="modePaiement"
                        class="form-select">
                  <option [value]="ModePaiementEnum.Carte">💳 Carte bancaire</option>
                  <option [value]="ModePaiementEnum.Virement">🏦 Virement</option>
                  <option value="PayPal">💰 PayPal</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showRechargeModal = false">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!rechargeForm.valid || rechargingInProgress">
                  {{ rechargingInProgress ? 'Traitement...' : 'Recharger' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="alert alert-success" *ngIf="successMessage">
        ✅ {{ successMessage }}
      </div>
      <div class="alert alert-danger" *ngIf="errorMessage">
        ❌ {{ errorMessage }}
      </div>
    </div>
  `,
  styleUrls: ['./portefeuille.component.scss']
})
export class PortefeuilleComponent implements OnInit {
  portefeuille: PorteFeuille | null = null;
  transactions: PFTransaction[] = [];
  stats: PortefeuilleStats | null = null;
  
  // Pagination
  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  };
  
  // Filtres
  selectedType: TypeTransactionEnum | '' = '';
  
  // Modal de recharge
  showRechargeModal = false;
  rechargeData = {
    montant: 0,
    modePaiement: ModePaiementEnum.Carte
  };
  rechargingInProgress = false;
  
  // États
  loading = false;
  successMessage = '';
  errorMessage = '';
  
  // Enums pour le template
  TypeTransactionEnum = TypeTransactionEnum;
  ModePaiementEnum = ModePaiementEnum;

  constructor(
    public portefeuilleService: PortefeuilleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPortefeuille();
    this.loadTransactions();
  }

  loadPortefeuille(): void {
    this.loading = true;
    this.portefeuilleService.obtenirMonPortefeuille().subscribe({
      next: (response) => {
        this.portefeuille = response.portefeuille;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement portefeuille:', error);
        this.errorMessage = 'Erreur lors du chargement du portefeuille';
        this.loading = false;
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    const options = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      ...(this.selectedType && { type: this.selectedType })
    };

    this.portefeuilleService.obtenirMesTransactions(options).subscribe({
      next: (response) => {
        this.transactions = response.transactions;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement transactions:', error);
        this.errorMessage = 'Erreur lors du chargement des transactions';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.portefeuilleService.obtenirStatistiques().subscribe({
      next: (response) => {
        this.stats = response;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
        this.errorMessage = 'Erreur lors du chargement des statistiques';
      }
    });
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadTransactions();
  }

  recharger(): void {
    if (this.rechargeData.montant <= 0 || this.rechargeData.montant > 10000) {
      this.errorMessage = 'Le montant doit être entre 0,01€ et 10 000€';
      return;
    }

    this.rechargingInProgress = true;
    this.errorMessage = '';

    this.portefeuilleService.rechargerPortefeuille(this.rechargeData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.portefeuille = response.portefeuille;
        this.showRechargeModal = false;
        this.rechargeData.montant = 0;
        this.rechargingInProgress = false;
        
        // Recharger les transactions pour voir la nouvelle transaction
        this.loadTransactions();
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Erreur recharge:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la recharge';
        this.rechargingInProgress = false;
      }
    });
  }

  closeRechargeModal(event: Event): void {
    if (event.target === event.currentTarget) {
      this.showRechargeModal = false;
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getTransactionIcon(type: string): string {
    return this.portefeuilleService.getTransactionIcon(type as TypeTransactionEnum);
  }

  formatMontant(montant: number): string {
    return this.portefeuilleService.formatMontant(montant);
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}