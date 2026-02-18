import { Component, OnInit, signal } from '@angular/core';
import { CategorieBoutique } from '../../../core/models/admin/categorie-boutique.model';
import { CategorieBoutiqueService } from '../../../core/services/admin/categorie-boutique.service';
import { finalize } from 'rxjs';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from "@angular/common";
import { Dialog } from "../../../components/shared/dialog/dialog";
import { Loader } from "../../../components/shared/loader/loader";
import { EmptyRowList } from "../../../components/shared/empty-row-list/empty-row-list";

@Component({
  selector: 'app-boutiques-admin',
  imports: [ReactiveFormsModule, TitleCasePipe, Dialog, Loader, EmptyRowList],
  templateUrl: './boutiques-admin.html',
  styleUrl: './boutiques-admin.scss',
})
export class BoutiquesAdmin implements OnInit {
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private categorieBoutiqueService: CategorieBoutiqueService
  ) {
    this.setEtageForm();
  }

  ngOnInit(): void {
    this.getAllCategories();
  }

  // ---- CATEGORIE BOUTIQUE ----

  categorieForm: any;
  categories = signal<CategorieBoutique[]>([]);

  categorieEditMode = signal(false);
  editingCategorieId = signal<string | null>(null);

  showCategorieDeleteDialog = signal(false);
  deletingCategorieId = signal<string | null>(null);

  getAllCategories() {
    this.isLoading.set(true);

    this.categorieBoutiqueService.obtenirCategories()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.categories.set(res.categories);
        },
        error: console.error
      });
  }

  setEtageForm() {
    this.categorieForm = this.fb.nonNullable.group({
      nom: ['', [Validators.required]]
    });
  }

  createNewCategory() {
    if (this.categorieForm.invalid) return;
    this.isLoading.set(true);

    const categorie: Partial<CategorieBoutique> = { 
      ...this.categorieForm.getRawValue(),
      isActive: true
    };

    this.categorieBoutiqueService.creerCategorie(categorie as CategorieBoutique)
      .pipe(
        finalize(() => this.isLoading.set(false))
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
    this.isLoading.set(true);
    
    const updatedCategorie: Partial<CategorieBoutique> = { 
      ...this.categorieForm.getRawValue(),
      _id: this.editingCategorieId()!,
      isActive: true
    };

    console.log(`Updated categorie: ${JSON.stringify(updatedCategorie)}`);

    this.categorieBoutiqueService.updateCategorie(updatedCategorie as CategorieBoutique)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          console.log(`Result: ${JSON.stringify(res)}`)
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

    this.isLoading.set(true);

    this.categorieBoutiqueService.deleteCategorie(idCategorie!)
      .pipe(
        finalize(() => this.isLoading.set(false))
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

}
