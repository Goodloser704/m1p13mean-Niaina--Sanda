import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Boutique, HoraireHebdo, JourSemaine, StatutBoutique } from '../../../core/models/commercant/boutique.model';
import { Loader } from "../../../components/shared/loader/loader";
import { CategorieBoutique } from '../../../core/models/admin/categorie-boutique.model';
import { CategorieBoutiqueService } from '../../../core/services/admin/categorie-boutique.service';
import { finalize } from 'rxjs';
import { compressImage } from '../../../core/functions/images-function';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HoraireFormModel, HorairesForm } from '../../../components/shared/horaires-form/horaires-form';
import { Location } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-creation-boutique',
  imports: [ReactiveFormsModule, Loader, HorairesForm, RouterLink],
  templateUrl: './creation-boutique.html',
  styleUrl: './creation-boutique.scss',
})
export class CreationBoutique implements OnInit {
  loaderService = inject(LoaderService);

  categories = signal<CategorieBoutique[]>([]);

  boutiqueForm: any;
  editingBoutique = signal<Boutique | null>(null);

  photoPreview = signal<string | null>(null);
  photoSizeError = signal(false);
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  Location = Location;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private cbService: CategorieBoutiqueService,
    private boutiqueService: BoutiqueService
  ) {
    this.setBoutiqueForm();
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loaderService.show();

    this.cbService.obtenirCategories()
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(`Categories: ${JSON.stringify(res)}`);
            this.categories.set(res.categories);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  setBoutiqueForm() {
    this.boutiqueForm = this.fb.nonNullable.group({
      nom: ['', [Validators.required]],
      categorie: ['', [Validators.required]],
      photo: [''],
      description: ['']
    });
  }

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
    this.boutiqueForm.patchValue({ photo: '' });
    this.photoPreview.set(null);
    this.photoSizeError.set(false);

    if (this.photoInput) {
      this.photoInput.nativeElement.value = ''; // vider le champ (enleve le nom et le fichier de l'input)
    }
  }

  creerBoutique() {
    const commercantId: string | null = this.authService.getCurrentUserId();
    if (!commercantId || this.boutiqueForm.invalid) return;

    this.loaderService.show();

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
    
    const newBoutique: Partial<Boutique> = {
      ...this.boutiqueForm.getRawValue(),
      commercant: commercantId,
      espace: null,
      statutBoutique: StatutBoutique.Inactif, // pas encore d'espace alloué
      horairesHebdo: horairesBackend
    };

    console.log(`New boutique: ${JSON.stringify(newBoutique)}`);

    this.boutiqueService.creerBoutique(newBoutique as Boutique)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(res.message);
            console.log(`Ma boutique: ${JSON.stringify(res.boutique)}`);
            
            this.boutiqueService.allerVersMaBoutique(res.boutique);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }
}
