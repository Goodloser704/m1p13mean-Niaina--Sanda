import { Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ProduitService } from '../../../../core/services/commercant/produit.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { Produit } from '../../../../core/models/commercant/produit.model';
import { createPagination } from '../../../../core/functions/pagination-function';
import { filter, finalize, switchMap, tap } from 'rxjs';
import { EmptyGridList } from "../../../../components/shared/empty-grid-list/empty-grid-list";
import { TypeProduit } from '../../../../core/models/commercant/type-produit.model';
import { TypeProduitService } from '../../../../core/services/commercant/type-produit.service';
import { compressImage } from '../../../../core/functions/images-function';
import { parseDuration, toFormattedString } from '../../../../core/functions/date-function';
import { DialogService } from '../../../../core/services/dialog.service';
import { Dialog } from '../../../../components/shared/dialog/dialog';
import { logSafe } from '../../../../core/functions/console-function';
import { RowProduct } from "../../../../components/commercant/row-product/row-product";
import { PaginationComponent } from "../../../../components/shared/pagination-component/pagination-component";

@Component({
  selector: 'app-gestion-produit',
  imports: [EmptyGridList, ReactiveFormsModule, RowProduct, PaginationComponent],
  templateUrl: './gestion-produit.html',
  styleUrl: './gestion-produit.scss',
})
export class GestionProduit implements OnInit {
  newProduct = signal(false);

  boutiqueService = inject(BoutiqueService);
  loaderService = inject(LoaderService);

  maBoutique = computed(() => this.boutiqueService.currentBoutique()!);

  products = signal<Produit[]>([]);

  typesProduit = signal<TypeProduit[]>([]);

  productPagination = createPagination(10);

  editProductMode = signal(false);
  editingProductId = signal<string | null>(null);

  productForm: any;

  photoPreview = signal<string | null>(null);
  photoSizeError = signal(false);
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  @ViewChild('childSection') childSection!: ElementRef;
  @ViewChild('formSection') formSection!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private typeProduitService: TypeProduitService,
    private dialogService: DialogService
  ) {
    this.setProductForm();

    effect(() => {
      const page = this.productPagination.currentPage();

      this.getProducts(page);
    })
  }

  ngOnInit(): void {
    this.loaderService.show();

    this.typeProduitService.obtenirLesTypesParBoutique(this.maBoutique()._id)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.typesProduit.set(res.typesProduits);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  getProducts(page: number) {
    this.loaderService.show();

    this.boutiqueService.getBoutiqueProduits({
      idBoutique: this.maBoutique()._id,
      page: page,
      limit: this.productPagination.limit,
      disponibleOnly: false
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(`Nombre de produits: ${res.pagination.total}`);

            this.products.set(res.produits);
            this.productPagination.setTotalPages(res.pagination.totalPages);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  setProductForm() {
    this.productForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: [null as string | null],
      prix: ['', [Validators.min(0)]],
      typeProduit: ['', Validators.required],

      heure: [0, [Validators.min(0), Validators.max(23)]],
      minute: [0, [Validators.min(0), Validators.max(59)]],
      seconde: [0, [Validators.min(0), Validators.max(59)]],

      stock: [0, [Validators.min(0)]],
      photo: [null as string | null]
    });
  }

  async onPhotoSelected(event: Event) {
    this.photoSizeError.set(false);

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    console.log(file);

    if (file.size > 2 * (1024 * 1024)) {
      this.photoSizeError.set(true);
      input.value = "";

      return;
    }

    const compressed = await compressImage(file, 800, 0.7);

    this.productForm.patchValue({ photo: compressed });
    this.photoPreview.set(compressed);
  }

  clearPhoto() {
    this.productForm.patchValue({ photo: '' });
    this.photoPreview.set(null);
    this.photoSizeError.set(false);

    if (this.photoInput) {
      this.photoInput.nativeElement.value = ''; // vider le champ (enleve le nom et le fichier de l'input)
    }
  }

  toggleNewProduct() {
    this.newProduct.set(true);

    setTimeout(() => {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  discardNewProduct() {
    this.dialogService.open(Dialog, {
      data: { message: "Confirmer l'annulation ?" }
    })
    .pipe(filter(result => result === true))
    .subscribe(() => {
      this.newProduct.set(false);
      this.setProductForm();

      setTimeout(() => {
        this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  saveNewProduct() {
    if (this.productForm.invalid) return;
    this.loaderService.show();

    const productRaw = this.productForm.getRawValue();

    const durationString: string = toFormattedString({
      heure: productRaw.heure,
      minute: productRaw.minute,
      seconde: productRaw.seconde
    })
    const duration = parseDuration(durationString);
    const tempsPreparation: string | null = duration.isZero ? null : durationString

    const product: Produit = {
      ...productRaw,
      boutique: this.maBoutique()._id,
      tempsPreparation: tempsPreparation,
      stock: {
        nombreDispo: productRaw.stock,
        updatedAt: new Date()
      }
    } as Produit;

    logSafe(product);

    this.produitService.creerProduit(product)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.products.update(p =>  [res.produit, ...p]);
          console.log(res.message);

          this.newProduct.set(false);
          this.setProductForm();
        },
        error: console.error
      });
  }

  editProduct(produit: Produit) {
    this.editProductMode.set(true);
    this.editingProductId.set(produit._id);

    this.productForm.patchValue({
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      typeProduit: typeof produit.typeProduit === 'object'
        ? produit.typeProduit._id
        : produit.typeProduit,
      stock: produit.stock.nombreDispo,
      photo: produit.photo
    });

    if (produit.tempsPreparation) {
      const duration = parseDuration(produit.tempsPreparation);
      this.productForm.patchValue({
        heure: duration.hours,
        minute: duration.minutes,
        seconde: duration.seconds
      })
    } else {
      this.productForm.patchValue({
        heure: 0,
        minute: 0,
        seconde: 0,
      })
    }

    setTimeout(() => {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  discardEditProduct() {
    this.dialogService.open(Dialog, {
      data: { message: "Souhaitez vous annuler la modification ?" }
    })
    .pipe(filter(result => result === true))
    .subscribe(() => {
      this.editProductMode.set(false);
      this.editingProductId.set(null);
      this.setProductForm();

      setTimeout(() => {
        this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  saveEditedProduct() {
    console.log(`ProductForm: [${JSON.stringify(this.productForm.getRawValue())}], is valid: [${!this.productForm.invalid}]`);
    console.log(`EditingProductId: [${this.editingProductId()}]`);

    if (this.productForm.invalid || !this.editingProductId()) return;

    this.loaderService.show();

    const productRaw = this.productForm.getRawValue();

    const durationString: string = toFormattedString({
      heure: productRaw.heure,
      minute: productRaw.minute,
      seconde: productRaw.seconde
    })
    const duration = parseDuration(durationString);
    const tempsPreparation: string | null = duration.isZero ? null : durationString

    const updatedProduct: Produit = {
      ...productRaw,
      _id: this.editingProductId()!,
      boutique: this.maBoutique()._id,
      tempsPreparation: tempsPreparation,
      stock: {
        nombreDispo: productRaw.stock,
        updatedAt: new Date()
      }
    } as Produit;

    logSafe(updatedProduct, 'Updated product: ');

    this.produitService.modifierProduit(updatedProduct)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          console.log(res.message);

          this.products.update(current =>
            current.map(e =>
              e._id == res.produit._id ? res.produit : e
            )
          );

          this.editProductMode.set(false);
          this.editingProductId.set(null);
          this.setProductForm();
        },
        error: console.error
      });
  }

  onSubmitProduct() {
    console.log(`NewProduct: [${this.newProduct()}], EditProduct: [${this.editProductMode()}]`);
    if (this.newProduct()) {
      this.saveNewProduct();
    } else if (this.editProductMode()) {
      console.log(`Save edited product`);
      this.saveEditedProduct();
    }
  }

  deleteProduct(idProduit: string) {
    this.dialogService
      .open(Dialog, {
        data: { message: "Confirmer la suppression ?" }
      })
      .pipe(
        filter(result => result === true),
        tap(() => this.loaderService.show()),
        switchMap(() => this.produitService.supprimerProduit(idProduit)),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: () => {
          this.products.update(current =>
            current.filter(e => e._id != idProduit)
          );
        },
        error: console.error
      });
  }
}
