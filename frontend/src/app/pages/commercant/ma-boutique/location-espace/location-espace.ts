import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { EmptyGridList } from "../../../../components/shared/empty-grid-list/empty-grid-list";
import { createPagination } from '../../../../core/functions/pagination-function';
import {
  Espace,
  EspaceQueryParams,
  EspaceStatut,
  Etage,
  getEspaceBoutiqueNames,
  getEspaceEtageNiveau
} from "../../../../core/models/admin/espaces.model";
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { getBoutiqueEspace } from '../../../../core/models/commercant/boutique.model';
import { UpperCasePipe, NgClass, CurrencyPipe, DatePipe } from "@angular/common";
import { LoaderService } from '../../../../core/services/loader.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { Dialog } from '../../../../components/shared/dialog/dialog';
import { filter, finalize, switchMap, tap } from 'rxjs';
import { EspacesService } from '../../../../core/services/admin/espaces.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DemandesLocationService } from '../../../../core/services/admin/demandes-location.service';
import { DemandeLocation, EtatDemandeLocation } from '../../../../core/models/admin/demande-location.model';
import { PaginationComponent } from "../../../../components/shared/pagination-component/pagination-component";

@Component({
  selector: 'app-location-espace',
  imports: [EmptyGridList, UpperCasePipe, NgClass, CurrencyPipe, ReactiveFormsModule, DatePipe, PaginationComponent],
  templateUrl: './location-espace.html',
  styleUrl: './location-espace.scss',
})
export class LocationEspace implements OnInit {
  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => this.boutiqueService.currentBoutique()!);
  espaceActuel = computed(() => 
    getBoutiqueEspace(this.maBoutique())
  );

  etages = signal<Etage[]>([]);

  filterForm!: FormGroup;
  appliedFilters = signal<{
    keyword?: string;
    etage?: string;
    surfaceMin?: string;
    surfaceMax?: string;
    loyerMax?: string;
  }>({});
  
  espacesDispo = signal<Espace[]>([]);
  espacesDispoPagination = createPagination(10);

  EspaceStatut = EspaceStatut;

  mesDemandes = signal<DemandeLocation[]>([]);
  demandesPaginations = createPagination(10);

  nomEtage = getEspaceEtageNiveau;
  nomBoutique = getEspaceBoutiqueNames;

  constructor(
    private fb: FormBuilder,
    private espacesService: EspacesService,
    private dlService: DemandesLocationService,
    private loaderService: LoaderService,
    private dialogService: DialogService
  ) {
    this.filterForm = this.fb.group({
      keyword: [null],
      etage: [null],
      surfaceMin: [null],
      surfaceMax: [null],
      loyerMax: [null],
    });

    effect(() => {
      const page = this.espacesDispoPagination.currentPage();
      const filters = this.appliedFilters();

      this.getEspacesDisponible(page, filters);
    });

    effect(() => {
      const page = this.demandesPaginations.currentPage();
      
      this.getDemandes(page);
    })
  }

  ngOnInit(): void {
    this.loaderService.show();

    this.espacesService.getAllFloor()
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.etages.set(res.etages);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  getEspacesDisponible(
    page: number,
    filters?: {
      keyword?: string;
      etage?: string;
      surfaceMin?: string;
      surfaceMax?: string;
      loyerMax?: string;
    }
  ) {
    this.loaderService.show();

    const params: EspaceQueryParams = {
      page,
      limit: this.espacesDispoPagination.limit,
      statut: EspaceStatut.Disponible,
      search: filters?.keyword || undefined,
      etage: filters?.etage || undefined,
      surfaceMin: filters?.surfaceMin ? Number(filters.surfaceMin) : undefined,
      surfaceMax: filters?.surfaceMax ? Number(filters.surfaceMax) : undefined,
      loyerMax: filters?.loyerMax ? Number(filters.loyerMax) : undefined,
    };

    this.espacesService.getAllSpaces(params)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.espacesDispo.set(
            res.espaces.sort(
              (a,b) => getEspaceEtageNiveau(a) - getEspaceEtageNiveau(b)
            )
          );
          this.espacesDispoPagination.setTotalPages(res.totalPages);
        },
        error: console.error
      });
  }

  applyFilters() {
    const values = this.filterForm.value;

    this.appliedFilters.set({
      keyword: values.keyword || undefined,
      etage: values.etage || undefined,
      surfaceMin: values.surfaceMin || undefined,
      surfaceMax: values.surfaceMax || undefined,
      loyerMax: values.loyerMax || undefined,
    });

    this.espacesDispoPagination.goTo(1);
  }

  resetFilters() {
    this.filterForm.reset();

    this.appliedFilters.set({});
    this.espacesDispoPagination.goTo(1);
  }

  getDemandes(page: number) {
    this.loaderService.show();

    this.dlService.obtenirMesDemandes(
      EtatDemandeLocation.EnAttente, 
      page, 
      this.demandesPaginations.limit
    )
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          this.mesDemandes.set(
            res.demandes.sort(
              (a, b) => b.createdAt.localeCompare(a.createdAt)
            )
          );
          this.demandesPaginations.setTotalPages(res.pagination.totalPages);
        },
        error: console.error
      })
  }

  demanderEnLocation(espace: Espace) {
    this.dialogService.open(Dialog, {
      data: { message: "Effectuer une demande ?" }
    })
    .pipe(
      filter(result => result === true),
      tap(() => this.loaderService.show()),
      switchMap(() => this.dlService.creerDemande(this.maBoutique()._id, espace._id)),
      finalize(() => this.loaderService.hide())
    )
    .subscribe({
      next: (res) => {
        try {
          console.log(res.message);
          this.mesDemandes.update(c => [res.demande, ...c]);
        } catch (err) {
          console.error(err);
        }
      },
      error: console.error
    });
  }

  annuerLaDemande(idDemande: string) {
    this.dialogService.open(Dialog, {
      data: { message: "Confirmer l'annulation ?" }
    })
    .pipe(
      filter(result => result === true),
      tap(() => this.loaderService.show()),
      switchMap(() => this.dlService.annulerDemande(idDemande)),
      finalize(() => this.loaderService.hide())
    )
    .subscribe({
      next: (res) => {
        this.mesDemandes.update(current => 
          current.filter(d => d._id !== idDemande)
        );
      },
      error: console.error
    });
  }
}
