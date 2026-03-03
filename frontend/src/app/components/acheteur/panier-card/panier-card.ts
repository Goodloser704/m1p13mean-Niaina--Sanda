import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PanierItem } from '../../../core/models/acheteur/panier.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { TypeAchat } from '../../../core/models/acheteur/achat.model';
import { PanierDeleteData } from '../../../core/services/acheteur/panier.service';

@Component({
  selector: 'app-panier-card',
  imports: [CurrencyPipe, NgClass],
  templateUrl: './panier-card.html',
  styleUrl: './panier-card.scss',
})
export class PanierCard {
  @Input() item!: PanierItem;

  @Output() delete = new EventEmitter<PanierDeleteData>();

  onDelete(idProduit: string, typeAchat: TypeAchat) {
    const data: PanierDeleteData = { idProduit, typeAchat };
    this.delete.emit(data);
  }
}
