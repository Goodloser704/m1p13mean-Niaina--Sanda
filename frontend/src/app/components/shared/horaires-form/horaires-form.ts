import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HoraireHebdo, JourSemaine } from '../../../core/models/commercant/boutique.model';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface HoraireFormModel {
  jour: JourSemaine;
  ouvert: boolean;
  debut: string;
  fin: string;
}

@Component({
  selector: 'app-horaires-form',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './horaires-form.html',
  styleUrl: './horaires-form.scss',
})
export class HorairesForm {
  @Input() title: string | null = null;
  @Input() class: string | string[] | null = null;

  @Input() initialHoraires: HoraireHebdo[] | null = null;
  @Output() horairesChange = new EventEmitter<HoraireFormModel[]>();

  form!: FormArray;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  get formGroups(): FormGroup[] {
    return this.form.controls as FormGroup[];
  }

  private initForm() {
    this.form = this.fb.array([]);

    const jours = Object.values(JourSemaine);

    jours.forEach(jour => {
      const existing = this.initialHoraires?.find(h => h.jour === jour);

      const group = this.fb.group({
        jour: [jour],
        ouvert: [!!existing],
        debut: [existing?.debut ?? '08:00'],
        fin: [existing?.fin ?? '17:00']
      }, { validators: this.horairesValidator });

      if (!existing) {
        group.get('debut')?.disable();
        group.get('fin')?.disable();
      }

      this.form.push(group);
    });

    this.form.valueChanges.subscribe(value => {
      this.horairesChange.emit(value);
    });
  }

  toggleJour(index: number) {
    const group = this.form.at(index) as FormGroup;
    const ouvert = group.get('ouvert')?.value;

    if (ouvert) {
      group.get('debut')?.enable();
      group.get('fin')?.enable();
    } else {
      group.get('debut')?.disable();
      group.get('fin')?.disable();
    }
  }

  private horairesValidator(group: AbstractControl) {
    const ouvert = group.get('ouvert')?.value;
    const debut = group.get('debut')?.value;
    const fin = group.get('fin')?.value;

    if (!ouvert) return null;

    if (debut && fin && debut >= fin) {
      return { horaireInvalide: true };
    }

    return null;
  }
}
