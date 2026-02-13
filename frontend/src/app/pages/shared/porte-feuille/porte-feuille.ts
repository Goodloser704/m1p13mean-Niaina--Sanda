import { Component, OnInit, signal } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { PorteFeuille as PF, PFTransaction } from '../../../core/models/porte-feuille';
import { Loader } from "../../../components/shared/loader/loader";
import { PorteFeuilleService } from '../../../core/services/porte-feuille.service';
import { CurrencyPipe, DatePipe } from "@angular/common";

@Component({
  selector: 'app-porte-feuille',
  imports: [Loader, CurrencyPipe, DatePipe],
  templateUrl: './porte-feuille.html',
  styleUrl: './porte-feuille.scss',
})
export class PorteFeuille implements OnInit {
  porteFeuille = signal<PF | null>(null);
  transactions = signal<PFTransaction[]>([]);

  today: string = new Date().toISOString();
  isLoading = signal(false);

  constructor(
    private authService: AuthService, 
    private porteFeuilleService: PorteFeuilleService, 
    private router: Router) {}

  ngOnInit() {
    this.loadPorteFeuille();
  }

  loadPorteFeuille() {
    this.isLoading.set(true);

    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.porteFeuilleService.obtenirMonPorteFeuille(userId)
        .subscribe({
          next: (res) => {
            this.porteFeuille.set(res.wallet);
            this.transactions.set(res.transactions);
          },
          error: (err) => {
            console.error(err);
            this.isLoading.set(false);
          },
          complete: () => this.isLoading.set(false)
        })
    } else {
      this.isLoading.set(false);
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
