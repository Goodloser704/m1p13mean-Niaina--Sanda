import { Component, computed, Input, OnInit, Signal } from '@angular/core';
import { Produit } from '../../../core/models/commercant/produit.model';
import { PanierAjoutData } from '../../../core/services/acheteur/panier.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypeAchat, typeAchatLabel } from '../../../core/models/acheteur/achat.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-to-cart-dialog',
  imports: [ReactiveFormsModule, NgClass, CurrencyPipe],
  templateUrl: './add-to-cart-dialog.html',
  styleUrl: './add-to-cart-dialog.scss',
})
export class AddToCartDialog implements OnInit {
  @Input() message: string | null = null;
  @Input() produit!: Produit;
  @Input() disponible!: number;

  close!: (result: PanierAjoutData | null) => void;

  form!: FormGroup;

  quantiteSignal!: Signal<number>;
  montantPreview = computed(() =>
    this.quantiteSignal() * this.produit.prix
  );
  
  typesAchat = Object.values(TypeAchat).map((type) => ({
    type,
    label: typeAchatLabel(type)
  }));

  constructor() {
    this.form = new FormGroup({
      quantite: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.disponible)
      ]),
      typeAchat: new FormControl<TypeAchat>(
        TypeAchat.Recuperer,
        [Validators.required]
      )
    });

    this.quantiteSignal = toSignal(
      this.form.get('quantite')!.valueChanges,
      { initialValue: 1 }
    );
  }

  ngOnInit(): void {
    // this.form = new FormGroup({
    //   quantite: new FormControl<number>(1, [
    //     Validators.required,
    //     Validators.min(1),
    //     Validators.max(this.disponible)
    //   ]),
    //   typeAchat: new FormControl<TypeAchat>(
    //     TypeAchat.Recuperer,
    //     [Validators.required]
    //   )
    // });
  }

  get quantiteControl() {
    return this.form.get('quantite')!;
  }

  submit() {
    if (this.form.invalid) return;

    const data: PanierAjoutData = {
      produit: this.produit,
      quantite: this.form.value.quantite!,
      typeAchat: this.form.value.typeAchat!
    };

    console.log(`Panier ajout data: ${JSON.stringify(data)}`);

    this.close(data);
  }
}
