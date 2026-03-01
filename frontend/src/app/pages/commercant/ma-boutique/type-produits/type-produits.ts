import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { LoaderService } from '../../../../core/services/loader.service';
import { TypeProduitService } from '../../../../core/services/commercant/type-produit.service';
import { TypeProduit } from '../../../../core/models/commercant/type-produit.model';
import { filter, finalize, switchMap, tap } from 'rxjs';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmptyRowList } from "../../../../components/shared/empty-row-list/empty-row-list";
import { TitleCasePipe, NgClass } from "@angular/common";
import { Dialog } from "../../../../components/shared/dialog/dialog";
import { DialogService } from '../../../../core/services/dialog.service';

@Component({
  selector: 'app-type-produits',
  imports: [ReactiveFormsModule, EmptyRowList, TitleCasePipe, NgClass],
  templateUrl: './type-produits.html',
  styleUrl: './type-produits.scss',
})
export class TypeProduits implements OnInit, AfterViewInit {
  @ViewChild('childSection') childSection!: ElementRef;
  @ViewChild('typeFormSection') typeFormSection!: ElementRef;
  
  loaderService = inject(LoaderService);

  typeForm: any;
  types = signal<TypeProduit[]>([]);

  typeEditMode = signal(false);
  editingTypeId = signal<string | null>(null);

  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => this.boutiqueService.maBoutique()!);

  ICONES_TYPE_PRODUIT = [
    { label: 'Nourriture', value: 'bi-cup-hot' },
    { label: 'Téléphonie', value: 'bi-phone' },
    { label: 'Bijoux', value: 'bi-gem' },
    { label: 'Vêtements', value: 'bi-bag' },
    { label: 'Jeux', value: 'bi-controller' },
    { label: 'Panier', value: 'bi-cart' },
    { label: 'Promo', value: 'bi-tag' },
    { label: 'Montres', value: 'bi-watch' },
    { label: 'Informatique', value: 'bi-laptop' }
  ];

  constructor(
    private fb: FormBuilder,
    private typeProduitService: TypeProduitService,
    private dialogService: DialogService
  ) {
    this.setTypeForm();
  }

  ngOnInit(): void {
     this.getAllTypes();
  }

  ngAfterViewInit() {
    //this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getAllTypes() {
    this.loaderService.show();

    this.typeProduitService.obtenirLesTypesParBoutique(this.maBoutique()._id)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.types.set(res.typesProduits);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  setTypeForm() {
    this.typeForm = this.fb.group({
      type: ['', [Validators.required]],
      description: [''],
      icone: [''],
      couleur: ['']
    });
  }

  selectIcon(icon: string) {
    this.typeForm.patchValue({ icone: icon });
  }

  clearIcon() {
    this.typeForm.patchValue({ icone: null });
  }

  clearColor() {
    this.typeForm.patchValue({ couleur: null });
  }

  // ---- Core ----

  createNewType() {
    if (this.typeForm.invalid) return;
    this.loaderService.show();

    const formValue = this.typeForm.getRawValue();
    
    const newType: Partial<TypeProduit> = { 
      type: formValue.type,
      boutique: this.maBoutique()._id,
      description: formValue.description || undefined,
      icone: formValue.icone || undefined,
      couleur: formValue.couleur || undefined
    };

    this.typeProduitService.creerTypeProduit(newType as TypeProduit)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.types.update(c =>  [res.typeProduit, ...c]);
          this.typeForm.reset();
        },
        error: (err) => {
          console.error('Erreur création type:', err);
          if (err.error?.message) {
            alert(err.error.message);
          }
        }
      });
  }

  editType(type: TypeProduit) {
    this.typeEditMode.set(true);
    this.editingTypeId.set(type._id);

    this.typeForm.patchValue({
      type: type.type,
      description: type.description,
      icone: type.icone,
      couleur: type.couleur
    });

    this.typeFormSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  discardEditType() {
    this.typeEditMode.set(false);
    this.editingTypeId.set(null);
    this.typeForm.reset();
  }

  saveEditedType() {
    if (this.typeForm.invalid || !this.editingTypeId()) return;
    this.loaderService.show();
    
    const formValue = this.typeForm.getRawValue();
    
    const updatedType: Partial<TypeProduit> = { 
      _id: this.editingTypeId()!,
      type: formValue.type,
      boutique: this.maBoutique()._id,
      description: formValue.description || undefined,
      icone: formValue.icone || undefined,
      couleur: formValue.couleur || undefined
    };

    this.typeProduitService.modifierTypeProduit(updatedType as TypeProduit)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.types.update(current => 
            current.map(e => 
              e._id == res.typeProduit._id ? res.typeProduit : e 
            )
          );

          this.discardEditType();
        },
        error: (err) => {
          console.error('Erreur modification type:', err);
          if (err.error?.message) {
            alert(err.error.message);
          }
        }
      });
  }

  onSubmitType() {
    if (this.typeEditMode()) {
      this.saveEditedType()
    } else {
      this.createNewType();
    }
  }

  deleteType(idType: string) {
    this.dialogService
      .open(Dialog, {
        data: { message: "Confirmer la suppression ??" }
      })
      .pipe(
        filter(result => result === true),
        tap(() => this.loaderService.show()),
        switchMap(() => 
          this.typeProduitService.supprimerTypeProduit(idType)
        ),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: () => {
          this.types.update(current => 
            current.filter(e => e._id != idType)
          );
        },
        error: console.error
      });
  }

  // -- End Core --
}
