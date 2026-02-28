import { Component, computed, effect, inject, signal } from '@angular/core';
import { createPagination } from '../../../../core/functions/pagination-function';
import { Achat, createMockAchat, EtatAchat, TypeAchat } from '../../../../core/models/acheteur/achat.model';
import { AchatService } from '../../../../core/services/acheteur/achat.service';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, finalize, of, switchMap, tap } from 'rxjs';
import { DurationDialog } from '../../../../components/shared/duration-dialog/duration-dialog';
import { AchatCard } from "../../../../components/commercant/achat-card/achat-card";

@Component({
  selector: 'app-gestion-achats',
  imports: [AchatCard],
  templateUrl: './gestion-achats.html',
  styleUrl: './gestion-achats.scss',
})
export class GestionAchats {
  achatTest = createMockAchat();
  achatValideTest = createMockAchat({
    etat: EtatAchat.Validee
  });

  achatsEnAttente = signal<Achat[]>([]);
  achatsEnAttentePagination = createPagination(10);

  historiqueAchats = signal<Achat[]>([]);
  historiquePagination = createPagination(10);

  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => this.boutiqueService.maBoutique()!);

  typeAchats = Object.values(TypeAchat);
  filtreTypesAchats = signal<TypeAchat | undefined>(undefined);

  constructor(
    private achatService: AchatService,
    private dialogService: DialogService,
    private loaderService: LoaderService
  ) {
    effect(() => {
      const page = this.achatsEnAttentePagination.currentPage();
      
      this.getCommercantAchatsEnAttente(page, [TypeAchat.Livrer, TypeAchat.Recuperer]);
    })
    
    effect(() => {
      const page = this.historiquePagination.currentPage();
      const typesAchat = this.filtreTypesAchats();

      if (typesAchat !== undefined) {
        this.getHistoriqueAchat(page, [typesAchat]);
      } else {
        this.getHistoriqueAchat(page, [TypeAchat.Livrer, TypeAchat.Recuperer]);
      }
    })
  }

  getCommercantAchatsEnAttente(page: number, typesAchat?: TypeAchat[]) {
    this.loaderService.show();

    this.achatService.getCommercantAchats({
      idBoutique: this.maBoutique()._id,
      etatsAchat: [EtatAchat.EnAttente],
      typesAchat: typesAchat,
      page: page,
      limit: this.achatsEnAttentePagination.limit,
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.achatsEnAttente.set(res.achats);
            this.achatsEnAttentePagination.setTotalPages(res.pagination.totalPages);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  getHistoriqueAchat(page: number, typesAchat?: TypeAchat[]) {
    this.loaderService.show();

    this.achatService.getCommercantAchats({
      idBoutique: this.maBoutique()._id,
      etatsAchat: [EtatAchat.Validee],
      typesAchat: typesAchat,
      page: page,
      limit: this.historiquePagination.limit
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.historiqueAchats.set(res.achats);
            this.historiquePagination.setTotalPages(res.pagination.totalPages);
          } catch (err) {
            console.error(err);
          }
        }, 
        error: console.error
      });
  }

  validerLivraison(idAchat: string) {
    this.dialogService.open(DurationDialog, {
      data: { message: 'Veuillez saisir la durée de livraison (hh:mm)' }
    })
      .pipe(
        filter((result) => result !== null),
        tap((result) => {
          console.log(`Duree de livraison: ${result}`);
          this.loaderService.show();
        }),
        switchMap((result) => this.achatService.validerLivraison(idAchat, result)),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: (res) => {
          try {
            console.log(res.message);
            const achat = this.achatsEnAttente().find(a => a._id === idAchat)!;

            this.historiqueAchats.update(c => [achat, ...c]);
            this.achatsEnAttente.update(c => c.filter(a => a._id !== idAchat));
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }
}
