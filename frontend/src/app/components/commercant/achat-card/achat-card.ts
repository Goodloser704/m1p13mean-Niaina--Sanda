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

  getDisponibiliteLabel(): string {
    if (!this.achat?.typeAchat?.dateFin) return '';

    const now = new Date().getTime();
    const dateFin = new Date(this.achat.typeAchat.dateFin).getTime();

    const diffMs = dateFin - now;
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));

    // Déjà disponible
    if (diffMinutes <= 0) {
      return 'Disponible';
    }

    // Moins d'1 heure → afficher minutes
    if (diffMinutes < 60) {
      return `Disponible dans ${diffMinutes} min`;
    }

    // Plus d'1 heure → afficher date complète
    return new Date(this.achat.typeAchat.dateFin)
      .toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  }
}
