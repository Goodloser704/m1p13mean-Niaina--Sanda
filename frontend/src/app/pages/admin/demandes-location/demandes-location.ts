import { filter, finalize, switchMap, tap } from 'rxjs';
import { createPagination } from '../../../core/functions/pagination-function';
import { DemandeLocation, EtatDemandeLocation } from '../../../core/models/admin/demande-location.model';
import { DemandesLocationService } from './../../../core/services/admin/demandes-location.service';
import { AfterViewInit, Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Location, NgClass, CurrencyPipe, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { LoaderService } from '../../../core/services/loader.service';
import { getBoutiqueCommercantLabel } from '../../../core/models/commercant/boutique.model';
import { getEtage } from '../../../core/models/admin/espaces.model';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { DialogService } from '../../../core/services/dialog.service';
import { Dialog } from '../../../components/shared/dialog/dialog';

@Component({
  selector: 'app-demandes-location',
  imports: [NgClass, RouterLink, CurrencyPipe, DatePipe, EmptyGridList],
  templateUrl: './demandes-location.html',
  styleUrl: './demandes-location.scss',
})
export class DemandesLocation implements AfterViewInit {
  @ViewChild('childSection') childSection!: ElementRef;

  demandePagination = createPagination(10);
  ancienDemandePagination = createPagination(10);

  demandesEnCours = signal<DemandeLocation[]>([]);
  demandesWithDetails = computed(() => 
    this.demandesEnCours().map(demande => ({
      ...demande,
      commercantNames: getBoutiqueCommercantLabel(demande.boutique),
      espaceEtageNom: getEtage(demande.espace).nom
    }))
  );

  ancienDemandes = signal<DemandeLocation[]>([]);
  ancienDemandesWithDetails = computed(() => 
    this.ancienDemandes().map(demande => ({
      ...demande,
      commercantNames: getBoutiqueCommercantLabel(demande.boutique),
      espaceEtageNom: getEtage(demande.espace).nom
    }))
  );

  Location = Location;

  constructor(
    private demandesLocationService: DemandesLocationService,
    private dialogService: DialogService,
    private loaderService: LoaderService
  ) {
    effect(() => {
      const page = this.demandePagination.currentPage();
      this.getDemandesEnCours(page);
    })

    effect(() => {
      const page = this.demandePagination.currentPage();
      this.getAncienDemandes(page);
    })
  }

  ngAfterViewInit() {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getDemandesEnCours(page: number) {
    this.loaderService.show();

    this.demandesLocationService.obtenirDemandesParEtat(
      EtatDemandeLocation.EnAttente,
      page,
      this.demandePagination.limit
    )
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.demandesEnCours.set(res.demandes);
          this.demandePagination.setTotal(res.pagination.totalPages);
        },
        error: console.error
      })
  }

  getAncienDemandes(page: number) {
    this.loaderService.show();

    this.demandesLocationService.obtenirDemandesParEtat(
      EtatDemandeLocation.Acceptee,
      page,
      this.ancienDemandePagination.limit
    )
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.ancienDemandes.set(res.demandes);
          this.ancienDemandePagination.setTotal(res.pagination.totalPages);
        },
        error: console.error
      })
  }

  accepter(idDemande: string) {
   this.dialogService.open(Dialog, {
    data: { message: "Accepter la demande ?" }
   })
    .pipe(
      filter(result => result === true),
      tap(() => this.loaderService.show()),
      switchMap(() => this.demandesLocationService.accepterDemande(idDemande)),
      finalize(() => this.loaderService.hide())
    )
    .subscribe({
      next: (res) => {
        console.log(res.message);

        this.demandesEnCours.update(c => c.filter(d => d._id !== idDemande));
        this.ancienDemandes.update(c => [res.demande, ...c]);
      },
      error: console.error
    });
  }

  refuser(idDemande: string) {
    this.dialogService.open(Dialog, {
      data: { message: "Refuser la demande ?" }
    })
      .pipe(
        filter(result => result === true),
        tap(() => this.loaderService.show()),
        switchMap(() => this.demandesLocationService.refuserDemande(idDemande)),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: (res) => {
          console.log(res.message);

          this.demandesEnCours.update(c => c.filter(d => d._id !== idDemande));
        },
        error: console.error
      });
  }
}
