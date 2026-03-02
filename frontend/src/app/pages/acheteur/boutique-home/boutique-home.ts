import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { getBoutiqueCategorieLabel, getBoutiqueCommercantLabel } from '../../../core/models/commercant/boutique.model';
import { createPagination } from '../../../core/functions/pagination-function';
import { Produit } from '../../../core/models/commercant/produit.model';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { RowProduct } from "../../../components/commercant/row-product/row-product";
import { AchatService } from '../../../core/services/acheteur/achat.service';
import { PaginationComponent } from "../../../components/shared/pagination-component/pagination-component";
import { LoaderService } from '../../../core/services/loader.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ProduitService } from '../../../core/services/commercant/produit.service';
import { filter, finalize } from 'rxjs';
import { PanierService } from '../../../core/services/acheteur/panier.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddToCartDialog } from '../../../components/shared/add-to-cart-dialog/add-to-cart-dialog';

@Component({
  selector: 'app-boutique-home',
  imports: [TitleCasePipe, NgClass, EmptyGridList, RowProduct, PaginationComponent, ReactiveFormsModule],
  templateUrl: './boutique-home.html',
  styleUrl: './boutique-home.scss',
})
export class BoutiqueHome implements OnInit, AfterViewInit {
  boutiqueService = inject(BoutiqueService);
  currentBoutique = computed(() => this.boutiqueService.currentBoutique()!);

  categorieLabel = signal('');
  nomCommercant = signal('');

  readonly isOuverte = this.boutiqueService.isBoutiqueOuverte;

  produits = signal<Produit[]>([]);
  produitsPagination = createPagination(12);
  searchedProduit = signal<string | undefined>(undefined);
  searchForm = new FormGroup({
    keyword: new FormControl<string | undefined>(undefined, [Validators.required])
  })

  queryParams = computed(() => ({
    page: this.produitsPagination.currentPage(),
    search: this.searchedProduit()
  }));

  @ViewChild('childSection') childSection!: ElementRef;
  @ViewChild('produitSection') produitSection!: ElementRef;

  constructor(
    private produitService: ProduitService,
    private panierService: PanierService,
    private loaderService: LoaderService,
    private dialogService: DialogService
  ) {
    effect(() => {
      const { page, search } = this.queryParams();

      this.getProduits(page, search);
    })
  }

  ngOnInit(): void {
    this.categorieLabel.set(getBoutiqueCategorieLabel(this.currentBoutique()));
    this.nomCommercant.set(getBoutiqueCommercantLabel(this.currentBoutique()));
  }

  ngAfterViewInit(): void {
    this.produitSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  quitterBoutique(route: string) {
    this.boutiqueService.quitterBoutique(route);
  }

  back() {
    this.quitterBoutique('/acheteur/all-boutiques');
  }

  getProduits(page: number, searchedProduit?: string) {
    this.loaderService.show();

    this.produitService.obtenirProduits({
      idBoutique: this.currentBoutique()._id,
      page: page,
      limit: this.produitsPagination.limit,
      search: searchedProduit
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.produits.set(res.produits);
            this.produitsPagination.setTotalPages(res.pagination.totalPages);
            this.produitsPagination.setTotalItems(res.pagination.total);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  rechercheProduits() {
    if (this.searchForm.invalid) return;
    const keyword = this.searchForm.value.keyword!;

    this.produitsPagination.goTo(1);

    if (this.searchedProduit() !== keyword) {
      this.searchedProduit.set(keyword);
    }
  }

  resetRecherche() {
    this.searchForm.reset();
    this.produitsPagination.goTo(1);
    this.searchedProduit.set(undefined);
  }

  ajouterAuPanier(produit: Produit) {
    const nombreDispoActuel = this.panierService.getDisponibleReel(produit);

    this.dialogService.open(AddToCartDialog, {
      data: {
        message: "Ajouter ce produit au panier",
        produit: produit,
        disponible: nombreDispoActuel
      }
    })
      .pipe(filter(result => result !== null))
      .subscribe({
        next: (result) => {
          try {
            this.panierService.ajouterProduit(result);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      })
  }
}
