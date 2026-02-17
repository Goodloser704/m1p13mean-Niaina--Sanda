import { EspaceQueryParams, EspaceStatut, getEspaceBoutiqueNames, getEspaceEtage } from './../../../core/models/admin/espaces.model';
import { Component, effect, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Loader } from "../../../components/shared/loader/loader";
import { Espace, Etage } from '../../../core/models/admin/espaces.model';
import { finalize, forkJoin } from 'rxjs';
import { EspacesService } from '../../../core/services/admin/espaces.service';
import { TitleCasePipe, UpperCasePipe, CurrencyPipe, NgClass } from "@angular/common";
import { Dialog } from "../../../components/shared/dialog/dialog";
import { createPagination } from '../../../core/functions/pagination-function';

@Component({
  selector: 'app-espaces',
  imports: [ReactiveFormsModule, Loader, TitleCasePipe, Dialog, UpperCasePipe, CurrencyPipe, NgClass],
  templateUrl: './espaces.html',
  styleUrl: './espaces.scss',
})
export class Espaces implements OnInit {
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private espacesService: EspacesService
  ) {
    this.setEtageForm();
    this.setEspaceForm();

    // effect observera les changements des signals a l'interieur de lui 
    // et reexecute son contenu a chaque fois
    effect(() => {
      // Liste des dependances:
      const page = this.espacePagination.currentPage(); // observer ceci

      this.getSpaces(page);
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);

    this.espacesService.getAllFloor()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.etages.set(res.etages),
        error: console.error
      });
  }

  // ----- ETAGE SECTION -----

  etageForm: any;
  etages = signal<Etage[]>([]);

  floorEditMode = signal(false);
  editingFloorId = signal<string | null>(null);

  showFloorDeleteDialog = signal(false);
  deletingFloorId = signal<string | null>(null);

  setEtageForm() {
    this.etageForm = this.fb.nonNullable.group({
      niveau: [
        '', 
        [
          Validators.required, 
          Validators.min(-2),
          Validators.pattern("^-?[0-9]+$") // Chiffre entier relatif uniquement
        ]
      ]
    });
  }

  createNewFloor() {
    if (this.etageForm.invalid) return;
    this.isLoading.set(true);

    const { niveau } = this.etageForm.getRawValue();

    const etage: Partial<Etage> = { 
      ...this.etageForm.getRawValue(),
      numero: niveau,
      nom: `Etage ${niveau}`,
      description: null,
      isActive: true
    };

    this.espacesService.createFloor(etage as Etage)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.etages.update(etages =>  [res.etage, ...etages]);
          console.log(res.message);

          this.etageForm.reset();
        },
        error: console.error
      });
  }

  editFloor(etage: Etage) {
    this.floorEditMode.set(true);
    this.editingFloorId.set(etage._id);

    this.etageForm.patchValue({
      niveau: etage.niveau
    });
  }

  discardEditFloor() {
    this.floorEditMode.set(false);
    this.editingFloorId.set(null);
    this.etageForm.reset();
  }

  saveEditedFloor() {
    if (this.etageForm.invalid || !this.editingFloorId()) return;
    this.isLoading.set(true);
    
    const { niveau } = this.etageForm.getRawValue();

    const updatedFloor: Partial<Etage> = { 
      _id: this.editingFloorId()!,
      niveau: niveau,
      numero: niveau,
      nom: `Etage ${niveau}`,
      description: null,
      isActive: true
    };

    console.log(`Updated floor: ${JSON.stringify(updatedFloor)}`);

    this.espacesService.updateFloor(updatedFloor as Etage)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          console.log(`Result: ${JSON.stringify(res)}`)
          this.etages.update(current => 
            current.map(e => 
              e._id == res.etage._id ? res.etage : e 
            )
          );

          this.discardEditFloor();
        },
        error: console.error
      });
  }

  onSubmitEtage() {
    if (this.floorEditMode()) {
      this.saveEditedFloor()
    } else {
      this.createNewFloor();
    }
  }

  toggleDeleteFloorDialog(etageId: string) {
    this.deletingFloorId.set(etageId);
    this.showFloorDeleteDialog.set(true);
  }

  discardDeleteFloor() {
    this.deletingFloorId.set(null);
    this.showFloorDeleteDialog.set(false);
  }

  onDeleteFloor(answer: boolean) {
    const etageId = this.deletingFloorId();
    if (!etageId || !answer) {
      this.discardDeleteFloor();
      return;
    };

    this.isLoading.set(true);

    this.espacesService.deleteFloor(etageId!)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.etages.update(current => 
            current.filter(e => e._id != etageId)
          );

          this.discardDeleteFloor();
        },
        error: console.error
      });
  }

  // --- END ETAGE SECTION ---

  // ---- ESPACES SECTION ----

  espaceForm: any;
  espaces = signal<Espace[]>([]);

  spaceEditMode = signal(false);
  editingSpaceId = signal<string | null>(null);

  showSpaceDeleteDialog = signal(false);
  deletingSpaceId = signal<string | null>(null);

  showLibererDialog = signal(false);
  libererSpaceId = signal<string | null>(null);

  espacePagination = createPagination(10);

  nomEtage = getEspaceEtage;
  nomBoutique = getEspaceBoutiqueNames;
  EspaceStatut = EspaceStatut;

  setEspaceForm() {
    this.espaceForm = this.fb.nonNullable.group({
      codeEspace: ['', [Validators.required, Validators.minLength(1)]],
      surface: ['', [Validators.required, Validators.min(1)]],
      etage: ['', [Validators.required]],
      loyer: ['', [Validators.required, Validators.min(0)]]
    })
  }

  creerEspace() {
    if (this.espaceForm.invalid) return;

    this.isLoading.set(true);
    const newSpace: Partial<Espace> = {
      ...this.espaceForm.getRawValue(),
      statut: EspaceStatut.Disponible,
      boutique: null
    }

    this.espacesService.createNewSpace(newSpace as Espace)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (this.espaces().length == this.espacePagination.limit) {
            this.espaces.update(e => e.slice(0, -1)); // 0 jusqu'a l'avant dernier element
          }
          this.espaces.update(e => [res.espace, ...e]);
        },
        error: console.error
      });
  }

  editEspace(espace: Espace) {
    this.spaceEditMode.set(true);
    this.editingSpaceId.set(espace._id);

    this.espaceForm.patchValue({
      codeEspace: espace.codeEspace,
      surface: espace.surface,
      etage: espace.etage,
      loyer: espace.loyer,
    });
  }

  discardEditEspace() {
    this.spaceEditMode.set(false);
    this.editingSpaceId.set(null);
    this.espaceForm.reset();
  }

  saveEditedEspace() {
    if (this.espaceForm.invalid || !this.editingSpaceId()) return;

    this.isLoading.set(true);

    const currentSpace = this.espaces()
      .find(e => e._id === this.editingSpaceId());

    if (!currentSpace) return;

    const updatedSpace: Espace = {
      ...currentSpace,
      ...this.espaceForm.getRawValue() // ecraser les champs modifiees
    };

    this.espacesService.editSpace(updatedSpace as Espace)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.espaces.update(current =>
            current.map(e =>
              e._id === res.espace._id ? res.espace : e
            )
          );

          this.discardEditEspace();
        },
        error: console.error
      });
  }


  onSubmitEspace() {
    if (this.spaceEditMode()) {
      this.saveEditedEspace()
    } else {
      this.creerEspace();
    }
  }

  toggleDeleteEspaceDialog(espaceId: string) {
    this.deletingSpaceId.set(espaceId);
    this.showSpaceDeleteDialog.set(true);
  }

  discardDeleteEspace() {
    this.deletingSpaceId.set(null);
    this.showSpaceDeleteDialog.set(false);
  }


  onDeleteEspace(answer: boolean) {
    const espaceId = this.deletingSpaceId();

    if (!espaceId || !answer) {
      this.discardDeleteEspace();
      return;
    }

    this.isLoading.set(true);

    this.espacesService.deleteSpace(espaceId)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.espaces.update(current =>
            current.filter(e => e._id !== espaceId)
          );

          // Revenir a la page precedent si la page actuel n'a plus d'element
          if (this.espaces().length === 0 && this.espacePagination.currentPage() > 1) {
            this.espacePagination.previous();
          }

          this.discardDeleteEspace();
        },
        error: console.error
      });
  }

  toggleLibererDialog(espaceId: string) {
    this.libererSpaceId.set(espaceId);
    this.showLibererDialog.set(true);
  }

  discardLibererDialog() {
    this.libererSpaceId.set(null);
    this.showLibererDialog.set(false);
  }

  onLibererEspace(answer: boolean) {
    const espaceId = this.libererSpaceId();

    if (!espaceId || !answer) {
      this.discardLibererDialog();
      return;
    }

    this.isLoading.set(true);

    this.espacesService.libererUneEspace(espaceId)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.espaces.update(current =>
            current.map(e =>
              e._id === espaceId
                ? { ...e, statut: EspaceStatut.Disponible, boutique: null }
                : e
            )
          );

          this.discardLibererDialog();
        },
        error: console.error
      });
  }

  getSpaces(page: number) {
    this.isLoading.set(true);

    const params: EspaceQueryParams = {
      page,
      limit: this.espacePagination.limit
    };

    this.espacesService.getAllSpaces(params)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.espaces.set(res.espaces.sort((a,b) => getEspaceEtage(a) - getEspaceEtage(b)));
          this.espacePagination.setTotal(res.totalPages);

          console.log(`Espaces res: ${JSON.stringify(res)}`);
        },
        error: console.error
      })
  }

  // -- END ESPACES SECTION --
}
