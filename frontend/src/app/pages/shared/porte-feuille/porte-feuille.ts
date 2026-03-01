import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { PorteFeuille as PF, PFTransaction } from '../../../core/models/porte-feuille.model';
import { PorteFeuilleService } from '../../../core/services/porte-feuille.service';
import { CurrencyPipe, DatePipe, NgClass } from "@angular/common";
import { LoaderService } from '../../../core/services/loader.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-porte-feuille',
  imports: [CurrencyPipe, DatePipe, NgClass],
  templateUrl: './porte-feuille.html',
  styleUrl: './porte-feuille.scss',
})
export class PorteFeuille implements OnInit {
  porteFeuille = signal<PF | null>(null);
  transactions = signal<PFTransaction[]>([]);
  stats = signal<any>(null);
  
  // Pagination
  page = signal(1);
  limit = 10;
  total = signal(0);
  
  // Filtres
  typeFilter = signal<string>('');

  today: string = new Date().toISOString();
  loaderService = inject(LoaderService);

  constructor(
    private authService: AuthService, 
    private porteFeuilleService: PorteFeuilleService, 
    private router: Router) {}

  ngOnInit() {
    this.loadPorteFeuille();
    this.loadTransactions();
    this.loadStats();
  }

  loadPorteFeuille() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.porteFeuilleService.obtenirMonPorteFeuille(userId)
      .subscribe({
        next: (res) => {
          console.log(`My wallet: ${JSON.stringify(res.wallet)}`);
          this.porteFeuille.set(res.wallet);
        },
        error: console.error
      });
  }

  loadTransactions() {
    this.loaderService.show();

    const params: any = {
      page: this.page(),
      limit: this.limit
    };

    if (this.typeFilter()) {
      params.type = this.typeFilter();
    }

    this.porteFeuilleService.obtenirMesTransactions(params)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.transactions.set(res.transactions || []);
          this.total.set(res.pagination?.total || 0);
        },
        error: console.error
      });
  }

  loadStats() {
    this.porteFeuilleService.obtenirStatistiques()
      .subscribe({
        next: (res) => {
          this.stats.set(res.statistiques);
        },
        error: console.error
      });
  }

  filterByType(type: string) {
    this.typeFilter.set(type);
    this.page.set(1);
    this.loadTransactions();
  }

  nextPage() {
    this.page.update(v => v + 1);
    this.loadTransactions();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
      this.loadTransactions();
    }
  }

  back() {
    const backPath = `${this.authService.getCurrentUserHomeByRole()}/user-profil`;
    console.log(`Back path: ${backPath}`);
    this.router.navigate([backPath]);
  }

  getTransactionerNames(wallet: PF | string): string {
    if (typeof wallet === 'object' && wallet !== null) {
      const owner = wallet.owner;

      if (typeof owner === 'object' && owner !== null) {
        return `${owner.nom} ${owner.prenoms}`;
      }
    }

    return 'Non defini';
  }
}
