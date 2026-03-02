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
  @Input() commercant = false;

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
    const dayPart = new Date(this.achat.typeAchat.dateFin)
      .toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

    const hoursPart = new Date(this.achat.typeAchat.dateFin)
      .toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    return `Disponible le ${dayPart} à ${hoursPart}`;
  }

  getLivraisonLabel(): string {
    if (!this.achat?.typeAchat?.dateFin) return '';

    const dateFin = new Date(this.achat.typeAchat.dateFin);
    let typeAchatAction = '';

    if (this.achat.typeAchat.type === TypeAchat.Livrer) {
      typeAchatAction = 'Livré le';
    } else if (this.achat.typeAchat.type === TypeAchat.Recuperer) {
      typeAchatAction = 'Récupérable le';
    }

    const dayPart = dateFin.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hoursPart = dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return `${typeAchatAction} ${dayPart} à ${hoursPart}`;
  }

  getLivraisonClass(): string {
    if (!this.achat?.typeAchat?.dateFin) return 'text-muted';

    const dateFin = new Date(this.achat.typeAchat.dateFin);
    const now = new Date();

    // Calculer dateFin + 15 minutes
    const dateFinPlus15 = new Date(dateFin.getTime() + 15 * 60 * 1000);

    if (now < dateFin) {
      return 'text-info'; // pas encore disponible
    } else if (now >= dateFin && now <= dateFinPlus15) {
      return 'text-success'; // disponible dans la fenêtre 15 min
    } else if (now > dateFinPlus15) {
      return 'text-danger'; // dépassé
    }

    return 'text-muted'; // fallback
  }
}
