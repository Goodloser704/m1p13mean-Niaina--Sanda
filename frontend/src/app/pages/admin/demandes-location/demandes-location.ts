import { finalize } from 'rxjs';
import { createPagination } from '../../../core/functions/pagination-function';
import { DemandeLocation, EtatDemandeLocation } from '../../../core/models/admin/demande-location.model';
import { DemandesLocationService } from './../../../core/services/admin/demandes-location.service';
import { Component, effect, signal } from '@angular/core';
import { Location, NgClass } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-demandes-location',
  imports: [NgClass, RouterLink],
  templateUrl: './demandes-location.html',
  styleUrl: './demandes-location.scss',
})
export class DemandesLocation {
  isLoading = signal(false);

  demandePagination = createPagination(10);
  ancienDemandePagination = createPagination(10);

  demandesEnCours = signal<DemandeLocation[]>([]);
  ancienDemandes = signal<DemandeLocation[]>([]);

  accepterDemande = signal<DemandeLocation | null>(null);
  showAccepterDialog = signal(false);

  refuserDemande = signal<DemandeLocation | null>(null);
  showRefuserDialog = signal(false);

  Location = Location;

  constructor(private demandesLocationService: DemandesLocationService) {
    effect(() => {
      const page = this.demandePagination.currentPage();
      this.getDemandesEnCours(page);
    })

    effect(() => {
      const page = this.demandePagination.currentPage();
      this.getAncienDemandes(page);
    })
  }

  getDemandesEnCours(page: number) {
    this.isLoading.set(true);

    this.demandesLocationService.obtenirDemandesParEtat(
      EtatDemandeLocation.EnAttente,
      page,
      this.demandePagination.limit
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.demandesEnCours.set(res.demandes);
          this.demandePagination.setTotal(res.pagination.totalPages);
        },
        error: console.error
      })
  }

  getAncienDemandes(page: number) {
    this.isLoading.set(true);

    this.demandesLocationService.obtenirDemandesParEtat(
      EtatDemandeLocation.Acceptee,
      page,
      this.ancienDemandePagination.limit
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.demandesEnCours.set(res.demandes);
          this.ancienDemandePagination.setTotal(res.pagination.totalPages);
        },
        error: console.error
      })
  }

  toggleAccepterDemande(demande: DemandeLocation) {
    this.accepterDemande.set(demande);
    this.showAccepterDialog.set(true);
  }

  discardAccepterDemande() {
    this.accepterDemande.set(null);
    this.showAccepterDialog.set(false);
  }

  accepter(answer: boolean) {
    if (!this.accepterDemande || !answer) return;

    this.isLoading.set(true);

    const demande = this.accepterDemande()!;
    this.demandesLocationService.accepterDemande(demande._id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.demandesEnCours.update(c => c.filter(d => d._id != demande._id));
          this.ancienDemandes.update(c => [res.demande, ...c]);
        },
        error: console.error
      })
  }

  toggleRefuserDemande(demande: DemandeLocation) {
    this.refuserDemande.set(demande);
    this.showRefuserDialog.set(true);
  }

  discardRefuserDemande() {
    this.refuserDemande.set(null);
    this.showRefuserDialog.set(false);
  }

  refuser(answer: boolean) {
    if (!this.refuserDemande || !answer) return;

    this.isLoading.set(true);

    const demande = this.refuserDemande()!;
    this.demandesLocationService.refuserDemande(demande._id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.demandesEnCours.update(c => c.filter(d => d._id != demande._id));
        },
        error: console.error
      })
  }
}
