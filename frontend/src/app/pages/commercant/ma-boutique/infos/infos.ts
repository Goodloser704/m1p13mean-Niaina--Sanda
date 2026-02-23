import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { TitleCasePipe, DatePipe } from "@angular/common";
import {
  Boutique,
  getBoutiqueCategorieId,
  getBoutiqueCategorieLabel,
  getBoutiqueCommercantLabel,
  getBoutiqueEspaceCode,
  getBoutiqueEspaceEtageNiveau,
  JourSemaine
} from "../../../../core/models/commercant/boutique.model";
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategorieBoutique } from '../../../../core/models/admin/categorie-boutique.model';
import { compressImage } from '../../../../core/functions/images-function';
import { CategorieBoutiqueService } from '../../../../core/services/admin/categorie-boutique.service';
import { finalize } from 'rxjs';
import { HorairesForm } from "../../../../components/shared/horaires-form/horaires-form";
import { LoaderService } from '../../../../core/services/loader.service';
import { User } from '../../../../core/models/user.model';
import { Espace } from '../../../../core/models/admin/espaces.model';

@Component({
  selector: 'app-infos',
  imports: [TitleCasePipe, DatePipe, ReactiveFormsModule, HorairesForm],
  templateUrl: './infos.html',
  styleUrl: './infos.scss',
})
export class Infos implements OnInit {
  loaderService = inject(LoaderService);

  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => this.boutiqueService.maBoutique()!);

  boutiqueEditMode = signal(false);
  boutiqueForm: any;
  @ViewChild('editInfo') edtiInfoSection!: ElementRef;

  photoPreview = signal<string | null>(null);
  photoSizeError = signal(false);
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  categories = signal<CategorieBoutique[]>([]);

  constructor(
    private fb: FormBuilder,
    private cbService: CategorieBoutiqueService
  ) {
    console.log(JSON.stringify(this.maBoutique()));
    
    this.setBoutiqueForm();
  }

  ngOnInit(): void {
    this.loaderService.show();

    this.cbService.obtenirCategories()
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.categories.set(res.categories);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      })
  }

  setBoutiqueForm() {
    this.boutiqueForm = this.fb.nonNullable.group({
      nom: ['', [Validators.required]],
      categorie: ['', [Validators.required]],
      photo: [''],
      description: ['']
    });
  }

  getBoutiqueCategorieId = getBoutiqueCategorieId;
  getBoutiqueCategorieLabel = getBoutiqueCategorieLabel;
  getBoutiqueCommercantLabel = getBoutiqueCommercantLabel;
  getBoutiqueEspaceCode = getBoutiqueEspaceCode;
  getBoutiqueEspaceEtageNiveau = getBoutiqueEspaceEtageNiveau;

  horairesUI: any[] = [];
  onHorairesChange(value: any[]) {
    this.horairesUI = value;
  }
  
  get auMoinsUnJourOuvert(): boolean {
    return this.horairesUI.some(h => h.ouvert);
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

    this.boutiqueForm.patchValue({ photo: compressed });
    this.photoPreview.set(compressed);
  }

  clearPhoto() {
    this.boutiqueForm.patchValue({ photo: this.maBoutique().photo });
    this.photoPreview.set(null);
    this.photoSizeError.set(false);

    if (this.photoInput) {
      this.photoInput.nativeElement.value = ''; // vider le champ (enleve le nom et le fichier de l'input)
    }
  }

  editBoutique() {
    this.boutiqueEditMode.set(true);

    const currentBoutique = this.maBoutique();
    this.boutiqueForm.patchValue({
      nom: currentBoutique.nom,
      categorie: (currentBoutique.categorie as CategorieBoutique)._id,
      photo: currentBoutique.photo,
      description: currentBoutique.description 
    });
    
    currentBoutique.horairesHebdo.forEach((j) => {
      this.horairesUI.push({
        jour: j.jour,
        debut: j.debut,
        fin: j.fin,
        ouvert: true
      });
    });

    this.edtiInfoSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  discardEditBoutique() {
    this.boutiqueEditMode.set(false);
    this.boutiqueForm.reset();
  }

  saveEditedBoutique() {
    if (this.boutiqueForm.invalid) return;

    const horairesBackend = this.horairesUI
      .filter(h => h.ouvert)
      .map(h => ({
        jour: h.jour,
        debut: h.debut,
        fin: h.fin
      }));

    if (horairesBackend.length === 0) {
      return;
    }

    this.loaderService.show();
    
    const currentBoutique = this.maBoutique();
    const updatedBoutique: Boutique = {
      ...this.boutiqueForm.getRawValue(),
      _id: currentBoutique._id,
      commercant: (currentBoutique.commercant as User)._id,
      espace: currentBoutique.espace ? (currentBoutique.espace as Espace)._id : null,
      statutBoutique: currentBoutique.statutBoutique,
      horairesHebdo: horairesBackend
    } as Boutique;

    console.log(`Updated boutique: ${JSON.stringify(updatedBoutique)}`);

    this.boutiqueService.updateMyBoutique(updatedBoutique)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(`Updated res: ${JSON.stringify(res.boutique)}`);
            
            const newBoutique: Boutique = {
              ...updatedBoutique,
              categorie: this.categories().find(c => c._id == updatedBoutique.categorie)!,
              commercant: currentBoutique.commercant,
              espace: currentBoutique.espace,
              createdAt: res.boutique.createdAt,
              updatedAt: res.boutique.updatedAt
            }
            this.boutiqueService.setMaBoutique(newBoutique);
            this.discardEditBoutique();
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });

  }
}
