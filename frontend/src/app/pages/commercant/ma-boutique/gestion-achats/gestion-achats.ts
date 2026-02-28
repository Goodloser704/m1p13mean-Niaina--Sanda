import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AchatCommercantService } from '../../../../core/services/commercant/achat.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { createPagination } from '../../../../core/functions/pagination-function';
import { finalize } from 'rxjs';
import { NgClass, CurrencyPipe, DatePipe } from "@angular/common";

@Component({
  selector: 'app-gestion-achats',
  imports: [NgClass, CurrencyPipe, DatePipe],
  templateUrl: './gestion-achats.html',
  styleUrl: './gestion-achats.scss',
})
export class GestionAchats implements OnInit {
  achatService = inject(AchatCommercantService);
  loaderService = inject(LoaderService);

  achats = signal<any[]>([]);
  pagination = createPagination(5); // 5 achats par page
  
  // Pour utiliser Math dans le template
  Math = Math;

  constructor() {
    effect(() => {
      const page = this.pagination.currentPage();
      this.loadAchats(page);
    });
  }

  ngOnInit(): void {
    // Le chargement se fait via l'effect
  }

  loadAchats(page: number) {
    this.loaderService.show();

    this.achatService.obtenirAchatsEnCours({
      page,
      limit: this.pagination.limit
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.achats.set(res.achats || []);
          if (res.pagination) {
            this.pagination.setTotal(res.pagination.totalPages);
            this.pagination.setTotalItems(res.pagination.total || 0);
          }
        },
        error: (err) => {
          console.error('Erreur chargement achats:', err);
          this.achats.set([]);
        }
      });
  }

  getEtatBadgeClass(etat: string): string {
    switch (etat) {
      case 'Validee': return 'badge-success';
      case 'EnAttente': return 'badge-warning';
      case 'Annulee': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getTypeAchatLabel(type: string): string {
    return type === 'Recuperer' ? 'À récupérer' : 'Livraison';
  }
}
