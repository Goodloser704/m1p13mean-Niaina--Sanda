import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { BoutiqueService } from '../../../core/services/acheteur/boutique.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Boutique } from '../../../core/models/acheteur/boutique.model';
import { createPagination } from '../../../core/functions/pagination-function';
import { finalize } from 'rxjs';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { NgClass, TitleCasePipe } from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-boutiques',
  imports: [EmptyGridList, NgClass, TitleCasePipe],
  templateUrl: './all-boutiques.html',
  styleUrl: './all-boutiques.scss',
})
export class AllBoutiques implements OnInit {
  boutiqueService = inject(BoutiqueService);
  loaderService = inject(LoaderService);
  router = inject(Router);

  boutiques = signal<Boutique[]>([]);
  boutiquePagination = createPagination(12);

  constructor() {
    effect(() => {
      const page = this.boutiquePagination.currentPage();
      this.getBoutiques(page);
    });
  }

  ngOnInit(): void {
    // Le chargement initial se fait via l'effect
  }

  getBoutiques(page: number) {
    this.loaderService.show();

    this.boutiqueService.obtenirToutesLesBoutiques({
      page: page,
      limit: this.boutiquePagination.limit
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(`Nombre de boutiques: ${res.pagination.total}`);
            this.boutiques.set(res.boutiques);
            this.boutiquePagination.setTotal(res.pagination.totalPages);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  voirBoutique(boutiqueId: string) {
    this.router.navigate(['/acheteur/boutique', boutiqueId]);
  }
}
