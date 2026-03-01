import { AfterViewInit, Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-ma-boutique',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './ma-boutique.html',
  styleUrl: './ma-boutique.scss',
})
export class MaBoutique implements AfterViewInit {
  @ViewChild('childSection') childSection!: ElementRef;
  
  loaderService = inject(LoaderService);

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

  ngAfterViewInit() {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  quitterMaBoutique(route: string) {
    this.boutiqueService.quitterMaBoutique(route);
  }

  back() {
    this.quitterMaBoutique('/commercant/mes-boutiques');
  }
}
