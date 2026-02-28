import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Achat, TypeAchat } from '../../../core/models/acheteur/achat.model';
import { DatePipe, CurrencyPipe, NgClass } from "@angular/common";

@Component({
  selector: 'app-achat-card',
  imports: [DatePipe, CurrencyPipe, NgClass],
  templateUrl: './achat-card.html',
  styleUrl: './achat-card.scss',
})
export class AchatCard {
  @Input() achat!: Achat;
  @Input() showValidateButton = false;

  @Output() validate = new EventEmitter<string>();

  TypeAchat = TypeAchat;

  onValidate() {
    this.validate.emit(this.achat._id);
  }
}
