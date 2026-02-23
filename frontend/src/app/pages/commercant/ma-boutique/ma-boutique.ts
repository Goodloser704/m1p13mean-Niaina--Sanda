import { Component, computed, inject, signal } from '@angular/core';
import { Loader } from "../../../components/shared/loader/loader";
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { Boutique } from '../../../core/models/commercant/boutique.model';
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: 'app-ma-boutique',
  imports: [Loader, RouterOutlet, TitleCasePipe, RouterLink, RouterLinkActive],
  templateUrl: './ma-boutique.html',
  styleUrl: './ma-boutique.scss',
})
export class MaBoutique {
  isLoading = signal(false);

  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => {
    const value = this.boutiqueService.maBoutique();
    if (!value) {
      this.back();
      console.error('Boutique introuvable');
    }
    return value!;
  });

  constructor() {
    if (!this.boutiqueService.maBoutique()) {
      this.back();
    } else {
      console.log(`Boutique: ${this.maBoutique().nom}`);
    }
  }

  quitterMaBoutique(route: string) {
    this.boutiqueService.quitterMaBoutique(route);
  }

  back() {
    this.quitterMaBoutique('/commercant/mes-boutiques');
  }
}
