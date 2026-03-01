import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Achat, TypeAchat, typeAchatLabel } from '../../../core/models/acheteur/achat.model';
import { DatePipe, CurrencyPipe, NgClass } from "@angular/common";

@Component({
  selector: 'app-achat-card',
  imports: [DatePipe, CurrencyPipe, NgClass],
  templateUrl: './achat-card.html',
  styleUrl: './achat-card.scss',
})
export class AchatCard implements OnInit {
  @Input() achat!: Achat;
  @Input() showValidateButton = false;

  @Output() validate = new EventEmitter<string>();

  TypeAchat = TypeAchat;
  typeAchatLabel = signal('');

  constructor() {}

  ngOnInit(): void {
    this.typeAchatLabel.set(typeAchatLabel(this.achat.typeAchat.type));
  }

  onValidate() {
    this.validate.emit(this.achat._id);
  }
}
