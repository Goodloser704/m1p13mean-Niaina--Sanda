import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { getBoutiqueCategorieLabel, getBoutiqueCommercantLabel } from '../../../core/models/commercant/boutique.model';

@Component({
  selector: 'app-boutique-home',
  imports: [TitleCasePipe, NgClass],
  templateUrl: './boutique-home.html',
  styleUrl: './boutique-home.scss',
})
export class BoutiqueHome implements OnInit {
  boutiqueService = inject(BoutiqueService);
  currentBoutique = computed(() => this.boutiqueService.currentBoutique()!);

  categorieLabel = signal('');
  nomCommercant = signal('');

  readonly isOuverte = this.boutiqueService.isBoutiqueOuverte;

  constructor() {

  }

  ngOnInit(): void {
    this.categorieLabel.set(getBoutiqueCategorieLabel(this.currentBoutique()));
    this.nomCommercant.set(getBoutiqueCommercantLabel(this.currentBoutique()));
  }

  quitterBoutique(route: string) {
    this.boutiqueService.quitterBoutique(route);
  }

  back() {
    this.quitterBoutique('/acheteur/all-boutiques');
  }
}
