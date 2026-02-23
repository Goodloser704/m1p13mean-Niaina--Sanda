import {
  getBoutiqueCategorieLabel,
  getBoutiqueCommercantLabel,
  getBoutiqueEspaceCode,
  getBoutiqueEspaceEtageNiveau,
  StatutBoutique
} from "./../../../core/models/commercant/boutique.model";
import { BoutiqueService } from './../../../core/services/commercant/boutique.service';
import { Component, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from "@angular/common";
import { Boutique } from '../../../core/models/commercant/boutique.model';
import { finalize } from 'rxjs';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { RouterLink } from "@angular/router";
import { Loader } from "../../../components/shared/loader/loader";

@Component({
  selector: 'app-mes-boutiques',
  imports: [TitleCasePipe, EmptyGridList, RouterLink, Loader],
  templateUrl: './mes-boutiques.html',
  styleUrl: './mes-boutiques.scss',
})
export class MesBoutiques implements OnInit {
  isLoading = signal(false);

  mesBoutiques = signal<Boutique[]>([]);
  StatutBoutique = StatutBoutique;

  constructor(private boutiqueService: BoutiqueService) {

  }

  ngOnInit(): void {
    this.loadMyBoutiques();
  }

  loadMyBoutiques() {
    this.isLoading.set(true);

    this.boutiqueService.getMyBoutiques()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          try {
            console.log(`Nombre de boutique: ${res.count}`);
            this.mesBoutiques.set(res.boutiques);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  allerVersMaBoutique(maBoutique: Boutique) {
    this.boutiqueService.allerVersMaBoutique(maBoutique);
  }

  getBoutiqueCategorieLabel = getBoutiqueCategorieLabel;
  getBoutiqueCommercantLabel = getBoutiqueCommercantLabel;
  getBoutiqueEspaceCode = getBoutiqueEspaceCode;
  getBoutiqueEspaceEtageNiveau = getBoutiqueEspaceEtageNiveau;
  
}
