import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { PorteFeuille as PF, PFTransaction, PorteFeuilleStatistique, TypeForUser } from '../../../core/models/porte-feuille.model';
import { PorteFeuilleService } from '../../../core/services/porte-feuille.service';
import { CurrencyPipe, DatePipe, NgClass } from "@angular/common";
import { LoaderService } from '../../../core/services/loader.service';
import { finalize } from 'rxjs';
import { createPagination } from '../../../core/functions/pagination-function';
import { PaginationComponent } from "../../../components/shared/pagination-component/pagination-component";

@Component({
  selector: 'app-porte-feuille',
  imports: [CurrencyPipe, DatePipe, NgClass, PaginationComponent],
  templateUrl: './porte-feuille.html',
  styleUrl: './porte-feuille.scss',
})
export class PorteFeuille implements OnInit {

  porteFeuille = signal<PF | null>(null);
  transactions = signal<PFTransaction[]>([]);
  stats = signal<PorteFeuilleStatistique | null>(null);
  
  pagination = createPagination(5);
  
  // Filtres
  typeFilter = signal<string | undefined>(undefined);

  today: string = new Date().toISOString();
  loaderService = inject(LoaderService);

  TypeForUser = TypeForUser;

  @ViewChild('filtreSection') filtreSection!: ElementRef;

  constructor(
    private authService: AuthService, 
    private porteFeuilleService: PorteFeuilleService, 
    private router: Router
  ) {
    effect(() => {
      const page = this.pagination.currentPage();
      const filter = this.typeFilter();

      this.loadTransactions(page, filter);
      this.filtreSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  }

  ngOnInit() {
    this.loadPorteFeuille();
    this.loadStats();
  }

  loadPorteFeuille() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.porteFeuilleService.obtenirMonPorteFeuille(userId)
      .subscribe({
        next: (res) => {
          //console.log(`My wallet: ${JSON.stringify(res.wallet)}`);
          
          this.porteFeuille.set(res.wallet);
        },
        error: console.error
      });
  }

  loadTransactions(page: number, typeFilter?: string) {
    this.loaderService.show();

    const params: any = {
      page: page,
      limit: this.pagination.limit
    };

    if (typeFilter) {
      params.type = this.typeFilter();
    }

    this.porteFeuilleService.obtenirMesTransactions(params)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            // console.log(`Transactions: ${JSON.stringify(res.transactions)}`);

            this.transactions.set(res.transactions);
            this.pagination.setTotalPages(res.pagination.totalPages);
            this.pagination.setTotalItems(res.pagination.total);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  loadStats() {
    this.porteFeuilleService.obtenirStatistiques()
      .subscribe({
        next: (res) => {
          console.log(`Statistiques: ${JSON.stringify(res.statistiques)}`);

          this.stats.set(res.statistiques);
        },
        error: console.error
      });
  }

  filterByType(type?: string) {
    this.typeFilter.set(type);
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
