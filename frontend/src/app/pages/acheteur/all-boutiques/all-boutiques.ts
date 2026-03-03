import { AfterViewInit, Component, effect, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { Boutique, StatutBoutique } from '../../../core/models/commercant/boutique.model';
import { createPagination } from '../../../core/functions/pagination-function';
import { AchatService } from '../../../core/services/acheteur/achat.service';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { LoaderService } from '../../../core/services/loader.service';
import { finalize, map } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { toSignal } from '@angular/core/rxjs-interop';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { BoutiqueCard } from "../../../components/commercant/boutique-card/boutique-card";
import { PaginationComponent } from "../../../components/shared/pagination-component/pagination-component";
import { NotificationsService } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-all-boutiques',
  imports: [ReactiveFormsModule, EmptyGridList, BoutiqueCard, PaginationComponent],
  templateUrl: './all-boutiques.html',
  styleUrl: './all-boutiques.scss',
})
export class AllBoutiques implements OnInit, AfterViewInit {
  boutiques = signal<Boutique[]>([]);
  boutiquePagination = createPagination(10);

  searchForm = new FormGroup({
    keyword: new FormControl<string>('', [Validators.required])
  });
  searchedKeyword = signal<string | null>(null);

  searchResults = signal<Boutique[]>([]);
  searchResultsPagination = createPagination(12);

  @ViewChild('childSection') childSection!: ElementRef;
  @ViewChild('searchResultSection') searchResultSection!: ElementRef;

  constructor(
    private boutiqueService: BoutiqueService,
    private achatService: AchatService,
    private notificationService: NotificationsService,
    private loaderService: LoaderService
  ) {
    effect(() => {
      const page = this.boutiquePagination.currentPage();

      this.getAllBoutiques(page);
    });

    effect(() => {
      const page = this.searchResultsPagination.currentPage();

      this.searchBoutique(page);
    });
  }

  ngOnInit(): void {
    this.notificationService.getUnreadCount()
      .subscribe({
        next: (res) => {
          try {
            this.notificationService.unreadCount.set(res.unreadCount);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  ngAfterViewInit(): void {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getAllBoutiques(page: number) {
    this.loaderService.show();

    this.boutiqueService.getAllBoutiqueByStatut(
      StatutBoutique.Actif,
      page,
      this.boutiquePagination.limit
    )
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.boutiques.set(res.boutiques);
            this.boutiquePagination.setTotalPages(res.pagination.totalPages);
            this.boutiquePagination.setTotalItems(res.pagination.total);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  searchBoutique(page: number) {
    if (this.searchForm.invalid) return;

    const keyword = this.searchForm.value.keyword;
    if (!keyword) {
      console.warn('Keyword is undefined');
      return;
    }
    this.searchedKeyword.set(keyword);

    this.loaderService.show();

    this.boutiqueService.searchBoutique(
      keyword,
      page,
      this.searchResultsPagination.limit
    )
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.searchResults.set(res.boutiques);
            this.searchResultsPagination.setTotalPages(res.pagination.totalPages);
            this.searchResultsPagination.setTotalItems(res.pagination.total);

            setTimeout(() => {
              this.searchResultSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  resetSearch() {
    this.searchForm.reset();
    this.searchResults.set([]);
    this.searchedKeyword.set(null);
  }

  allerVersBoutique(boutique: Boutique) {
    this.boutiqueService.allerVersBoutique(boutique, '/acheteur/boutique-home');
  }
}
