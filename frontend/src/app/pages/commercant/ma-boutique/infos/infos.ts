import { Component, computed, inject } from '@angular/core';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: 'app-infos',
  imports: [TitleCasePipe],
  templateUrl: './infos.html',
  styleUrl: './infos.scss',
})
export class Infos {
  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => this.boutiqueService.maBoutique()!);

  constructor() {
    console.log(JSON.stringify(this.maBoutique()));
  }
}
