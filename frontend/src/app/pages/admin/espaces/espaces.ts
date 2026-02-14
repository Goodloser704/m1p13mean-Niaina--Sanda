import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Loader } from "../../../components/shared/loader/loader";
import { Etage } from '../../../core/models/admin/espaces.model';
import { finalize, forkJoin } from 'rxjs';
import { EspacesService } from '../../../core/services/admin/espaces.service';
import { TitleCasePipe } from "@angular/common";
import { Dialog } from "../../../components/shared/dialog/dialog";

@Component({
  selector: 'app-espaces',
  imports: [ReactiveFormsModule, Loader, TitleCasePipe, Dialog],
  templateUrl: './espaces.html',
  styleUrl: './espaces.scss',
})
export class Espaces implements OnInit {
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private espacesService: EspacesService
  ) {
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

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading()

    forkJoin({
      etages: this.espacesService.getAllFloor()
    }).subscribe({
      next: (res) => {
        this.etages.set(res.etages.etages.sort((a,b) => a.niveau - b.niveau));
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    })
    
  }

  // ----- ETAGE SECTION -----

  etageForm: any;
  etages = signal<Etage[]>([]);

  floorEditMode = signal(false);
  editingFloorId = signal<string | null>(null);

  showFloorDeleteDialog = signal(false);
  deletingFloorId = signal<string | null>(null);

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
          this.etages.update(etages => 
            [...etages, res.etage].sort((a, b) => a.niveau - b.niveau)
          );
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

  onSubmit() {
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
}
