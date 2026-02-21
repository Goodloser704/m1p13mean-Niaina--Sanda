import { Component, signal } from '@angular/core';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Boutique } from '../../../core/models/commercant/boutique.model';

@Component({
  selector: 'app-creation-boutique',
  imports: [ReactiveFormsModule],
  templateUrl: './creation-boutique.html',
  styleUrl: './creation-boutique.scss',
})
export class CreationBoutique {
  isLoading = signal(false);

  boutiqueForm: any;
  editingBoutique = signal<Boutique | null>(null);

  constructor(
    private fb: FormBuilder,
    private boutiqueService: BoutiqueService
  ) {}

  setBoutiqueForm() {
    this.boutiqueForm = this.fb.nonNullable.group({
      nom: ['', [Validators.required]],
    });
  }

  creerBoutique() {

  }
}
