import {
  getBoutiqueCategorieLabel,
  getBoutiqueCommercantLabel,
  getBoutiqueEspaceCode,
  getBoutiqueEspaceEtageNiveau,
  StatutBoutique
} from "./../../../core/models/commercant/boutique.model";
import { BoutiqueService } from './../../../core/services/commercant/boutique.service';
import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { TitleCasePipe, NgClass } from "@angular/common";
import { Boutique } from '../../../core/models/commercant/boutique.model';
import { finalize } from 'rxjs';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { RouterLink } from "@angular/router";
import { LoaderService } from "../../../core/services/loader.service";
import { BoutiqueCard } from "../../../components/commercant/boutique-card/boutique-card";
import { NotificationsService } from "../../../core/services/notifications.service";

@Component({
  selector: 'app-mes-boutiques',
  imports: [TitleCasePipe, EmptyGridList, RouterLink, NgClass, BoutiqueCard],
  templateUrl: './mes-boutiques.html',
  styleUrl: './mes-boutiques.scss',
})
export class MesBoutiques implements OnInit, AfterViewInit {
  @ViewChild('childSection') childSection!: ElementRef;

  mesBoutiques = signal<Boutique[]>([]);
  StatutBoutique = StatutBoutique;

  constructor(
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationsService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMyBoutiques();

    this.notificationService.getUnreadCount()
      .subscribe({
        next: (res) => {
          try {
            this.notificationService.unreadCount.set(res.unreadCount);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  ngAfterViewInit() {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  loadMyBoutiques() {
    this.loaderService.show();

    this.boutiqueService.getMyBoutiques()
      .pipe(finalize(() => this.loaderService.hide()))
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
    this.boutiqueService.allerVersBoutique(maBoutique);
  }

  getBoutiqueCategorieLabel = getBoutiqueCategorieLabel;
  getBoutiqueCommercantLabel = getBoutiqueCommercantLabel;
  getBoutiqueEspaceCode = getBoutiqueEspaceCode;
  getBoutiqueEspaceEtageNiveau = getBoutiqueEspaceEtageNiveau;
  
}
