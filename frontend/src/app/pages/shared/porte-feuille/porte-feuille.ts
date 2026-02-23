import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { PorteFeuille as PF, PFTransaction } from '../../../core/models/porte-feuille.model';
import { Loader } from "../../../components/shared/loader/loader";
import { PorteFeuilleService } from '../../../core/services/porte-feuille.service';
import { CurrencyPipe, DatePipe } from "@angular/common";
import { LoaderService } from '../../../core/services/loader.service';
import { finalize } from 'rxjs';

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
  loaderService = inject(LoaderService);

  constructor(
    private authService: AuthService, 
    private porteFeuilleService: PorteFeuilleService, 
    private router: Router) {}

  ngOnInit() {
    this.loadPorteFeuille();
  }

  loadPorteFeuille() {
    this.loaderService.show();

    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.porteFeuilleService.obtenirMonPorteFeuille(userId)
        .pipe(finalize(() => this.loaderService.hide()))
        .subscribe({
          next: (res) => {
            console.log(`My wallet: ${JSON.stringify(res.wallet)}`);

            this.porteFeuille.set(res.wallet);
            this.transactions.set(res.transactions);
          },
          error: console.error
        })
    } else {
      this.loaderService.hide();
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
