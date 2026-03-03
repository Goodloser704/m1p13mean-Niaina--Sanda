import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Boutique, getBoutiqueCategorieLabel, getBoutiqueCommercantLabel, getBoutiqueEspaceCode, getBoutiqueEspaceEtageNiveau, StatutBoutique } from '../../../core/models/commercant/boutique.model';
import { NgClass, TitleCasePipe } from "@angular/common";

@Component({
  selector: 'app-boutique-card',
  imports: [NgClass, TitleCasePipe],
  templateUrl: './boutique-card.html',
  styleUrl: './boutique-card.scss',
})
export class BoutiqueCard implements OnInit {
  @Input() boutique!: Boutique;
  @Input() commercant: boolean = false;

  @Output() click = new EventEmitter<Boutique>();

  StatutBoutique = StatutBoutique;

  categorieLabel = signal('');
  commercantLabel = signal('');
  espaceCode = signal('');
  etageNiveau = signal(-111);

  constructor() {}

  ngOnInit(): void {
    this.categorieLabel.set(getBoutiqueCategorieLabel(this.boutique));
    this.commercantLabel.set(getBoutiqueCommercantLabel(this.boutique));
    this.espaceCode.set(getBoutiqueEspaceCode(this.boutique));
    this.etageNiveau.set(getBoutiqueEspaceEtageNiveau(this.boutique));
  }

  onClick(boutique: Boutique) {
    this.click.emit(boutique);
  }
}
