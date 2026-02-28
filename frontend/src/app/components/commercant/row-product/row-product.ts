import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { getTypeProduit, Produit } from '../../../core/models/commercant/produit.model';
import { CurrencyPipe, NgClass, TitleCasePipe } from "@angular/common";
import { TypeProduit } from '../../../core/models/commercant/type-produit.model';
import { TimeDurationPipe } from "../../../core/pipes/time-duration-pipe";

@Component({
  selector: 'app-row-product',
  imports: [CurrencyPipe, NgClass, TitleCasePipe, TimeDurationPipe],
  templateUrl: './row-product.html',
  styleUrl: './row-product.scss',
})
export class RowProduct implements OnInit {
  @Input() product!: Produit;
  typeProduit = signal<TypeProduit | null>(null);

  @Output() edit = new EventEmitter<Produit>();
  @Output() delete = new EventEmitter<string>();

  ngOnInit(): void {
    this.typeProduit.set(getTypeProduit(this.product));
  }

  editProduct(product: Produit) {
    this.edit.emit(product);
  }

  deleteProduct(idProduct: string) {
    this.delete.emit(idProduct);
  }
}
