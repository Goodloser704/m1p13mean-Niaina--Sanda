import { AfterViewChecked, AfterViewInit, Component, effect, OnInit, signal } from '@angular/core';
import { CategorieBoutique } from '../../../core/models/admin/categorie-boutique.model';
import { CategorieBoutiqueService } from '../../../core/services/admin/categorie-boutique.service';
import { finalize } from 'rxjs';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location, NgClass, TitleCasePipe } from "@angular/common";
import { Dialog } from "../../../components/shared/dialog/dialog";
import { Loader } from "../../../components/shared/loader/loader";
import { EmptyRowList } from "../../../components/shared/empty-row-list/empty-row-list";
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import {
  Boutique,
  getBoutiqueCategorieLabel,
  getBoutiqueCommercantLabel,
  getBoutiqueEspaceCode,
  getBoutiqueEspaceEtageNiveau,
  StatutBoutique
} from "../../../core/models/commercant/boutique.model";
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { createPagination } from '../../../core/functions/pagination-function';
import Aos from 'aos';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-boutiques-admin',
  imports: [ReactiveFormsModule, TitleCasePipe, Dialog, Loader, EmptyRowList, EmptyGridList, NgClass, RouterLink],
  templateUrl: './boutiques-admin.html',
  styleUrl: './boutiques-admin.scss',
})
export class BoutiquesAdmin implements OnInit, AfterViewInit, AfterViewChecked {
  isLoading = signal(false);
  private pendingRequests = 0;

  Location = Location;

  constructor(
    private fb: FormBuilder,
    private categorieBoutiqueService: CategorieBoutiqueService,
    private boutiqueService: BoutiqueService
  ) {
    this.setCategorieForm();

    effect(() => {
      const page = this.activeBoutiquesPagination.currentPage();
      this.getBoutiquesActives(page);
    });

    effect(() => {
      const page = this.inactiveBoutiquesPagination.currentPage();
      this.getBoutiquesInactives(page);
    });
  }

  ngOnInit(): void {
    this.getAllCategories();
  }

  ngAfterViewInit() {
    Aos.init();
  }

  ngAfterViewChecked() {
    Aos.refresh();
  }

  // ---- CATEGORIE BOUTIQUE ----

  categorieForm: any;
  categories = signal<CategorieBoutique[]>([]);

  categorieEditMode = signal(false);
  editingCategorieId = signal<string | null>(null);

  showCategorieDeleteDialog = signal(false);
  deletingCategorieId = signal<string | null>(null);

  getAllCategories() {
    this.startLoading();

    this.categorieBoutiqueService.obtenirCategories()
      .pipe(finalize(() => this.stopLoading()))
      .subscribe({
        next: (res) => {
          this.categories.set(res.categories);
        },
        error: console.error
      });
  }

  setCategorieForm() {
    this.categorieForm = this.fb.nonNullable.group({
      nom: ['', [Validators.required]]
    });
  }

  createNewCategory() {
    if (this.categorieForm.invalid) return;
    this.startLoading();

    const categorie: Partial<CategorieBoutique> = { 
      ...this.categorieForm.getRawValue(),
      isActive: true
    };

    this.categorieBoutiqueService.creerCategorie(categorie as CategorieBoutique)
      .pipe(
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: (res) => {
          this.categories.update(c =>  [res.categorie, ...c]);
          this.categorieForm.reset();
        },
        error: console.error
      });
  }

  editCategorie(categorie: CategorieBoutique) {
    this.categorieEditMode.set(true);
    this.editingCategorieId.set(categorie._id);

    this.categorieForm.patchValue({
      nom: categorie.nom
    });
  }

  discardEditCategorie() {
    this.categorieEditMode.set(false);
    this.editingCategorieId.set(null);
    this.categorieForm.reset();
  }

  saveEditedCategorie() {
    if (this.categorieForm.invalid || !this.editingCategorieId()) return;
    this.startLoading();
    
    const updatedCategorie: Partial<CategorieBoutique> = { 
      ...this.categorieForm.getRawValue(),
      _id: this.editingCategorieId()!,
      isActive: true
    };

    this.categorieBoutiqueService.updateCategorie(updatedCategorie as CategorieBoutique)
      .pipe(
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: (res) => {
          this.categories.update(current => 
            current.map(e => 
              e._id == res.categorie._id ? res.categorie : e 
            )
          );

          this.discardEditCategorie();
        },
        error: console.error
      });
  }

  onSubmitCategorie() {
    if (this.categorieEditMode()) {
      this.saveEditedCategorie()
    } else {
      this.createNewCategory();
    }
  }

  toggleDeleteCategorieDialog(idCategorie: string) {
    this.deletingCategorieId.set(idCategorie);
    this.showCategorieDeleteDialog.set(true);
  }

  discardDeleteCategorie() {
    this.deletingCategorieId.set(null);
    this.showCategorieDeleteDialog.set(false);
  }

  onDeleteCategorie(answer: boolean) {
    const idCategorie = this.deletingCategorieId();
    if (!idCategorie || !answer) {
      this.discardDeleteCategorie();
      return;
    };

    this.startLoading();

    this.categorieBoutiqueService.deleteCategorie(idCategorie!)
      .pipe(
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: () => {
          this.categories.update(current => 
            current.filter(e => e._id != idCategorie)
          );

          this.discardDeleteCategorie();
        },
        error: console.error
      });
  }

  // -- CATEGORIE BOUTIQUE END --

  // ---- Liste des boutiques ----

  activeBoutiques = signal<Boutique[]>([]);
  inactiveBoutiques = signal<Boutique[]>([]);

  activeBoutiquesPagination = createPagination(6);
  inactiveBoutiquesPagination = createPagination(6);

  StatutBoutique = StatutBoutique;

  getBoutiqueCategorieLabel = getBoutiqueCategorieLabel;
  getBoutiqueCommercantLabel = getBoutiqueCommercantLabel;
  getBoutiqueEspaceCode = getBoutiqueEspaceCode;
  getBoutiqueEspaceEtageNiveau = getBoutiqueEspaceEtageNiveau;

  getBoutiquesActives(page: number) {
    this.startLoading();

    this.boutiqueService.getAllBoutiqueByStatut(
      StatutBoutique.Actif, 
      page, 
      this.activeBoutiquesPagination.limit
    )
      .pipe(finalize(() => this.stopLoading()))
      .subscribe({
        next: (res) => {
          this.activeBoutiques.set(res.boutiques);
          this.activeBoutiquesPagination.setTotal(res.pagination.totalPages);
        },
        error: console.error
      });
  }

  getBoutiquesInactives(page: number) {
    this.startLoading();

    this.boutiqueService.getAllBoutiqueByStatut(
      StatutBoutique.Inactif,
      page, 
      this.inactiveBoutiquesPagination.limit
    )
      .pipe(finalize(() => this.stopLoading()))
      .subscribe({
        next: (res) => {
          this.inactiveBoutiques.set(res.boutiques);
          this.inactiveBoutiquesPagination.setTotal(res.pagination.totalPages);
        },
        error: console.error
      });
  }

  // -- End Liste des boutiques --

  private startLoading() {
    this.pendingRequests += 1;
    this.isLoading.set(true);
  }

  private stopLoading() {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);

    if (this.pendingRequests === 0) {
      this.isLoading.set(false);
    }
  }

}
