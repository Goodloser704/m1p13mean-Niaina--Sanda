import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { LoyerService } from '../../../../core/services/admin/loyer.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { createPagination } from '../../../../core/functions/pagination-function';
import { filter, finalize, switchMap, tap } from 'rxjs';
import { PFTransaction } from '../../../../core/models/porte-feuille.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DatePipe, CurrencyPipe, NgClass } from "@angular/common";
import { LoyerPaiement } from '../../../../core/models/commercant/commercant.model';
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { NgxMaskDirective } from "ngx-mask";
import { logSafe } from '../../../../core/functions/console-function';
import { DialogService } from '../../../../core/services/dialog.service';
import { Dialog } from '../../../../components/shared/dialog/dialog';

(pdfMake as any).vfs = pdfFonts['vfs'];

@Component({
  selector: 'app-loyers',
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe, NgClass, NgxMaskDirective],
  templateUrl: './loyers.html',
  styleUrl: './loyers.scss',
})
export class Loyers implements OnInit {
  boutiqueService = inject(BoutiqueService);
  maBoutique = computed(() => this.boutiqueService.maBoutique()!);

  historiques = signal<PFTransaction[]>([]);
  historiquePagination = createPagination(10);

  loyerForm = new FormGroup({
    montant: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    mois: new FormControl<string | null>(null, Validators.required),
    annee: new FormControl<string | null>(null, Validators.required)
  });

  readonly moisList = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Fevrier' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Aout' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Decembre' }
  ];

  readonly anneesList = Array.from(
    {length: 2034-2025+1}, 
    (_, i) => 2025+i
  );

  currentMonth = signal('');
  currentYear = signal(0);

  constructor(
    private loyerService: LoyerService,
    private loaderService: LoaderService,
    private dialogService: DialogService
  ) {
    const now = new Date();
    this.currentMonth.set(String(now.getMonth() + 1).padStart(2, '0'));
    this.currentYear.set(now.getFullYear());

    console.log(`Current: ${this.currentYear()}-${this.currentMonth()}`);

    effect(() => {
      const page = this.historiquePagination.currentPage();

      this.getHistoriqueLoyer(page);
    })
  }

  ngOnInit(): void {}

  payerLoyer() {
    if (!this.loyerForm.valid) return;

    const form = this.loyerForm.value;
    const periode = `${form.annee}-${form.mois}`;

    this.dialogService.open(Dialog, {
      data: { 
        message: `Confirmer le payement de ${form.montant?.toLocaleString()} Ar pour la periode ${periode} ?`
      }
    })
      .pipe(
        filter(result => result === true),
        tap(() => this.loaderService.show()),
        switchMap(() => {
          const data: LoyerPaiement = {
            boutiqueId: this.maBoutique()._id, // remplacer par l'ID de la boutique
            montant: form.montant!,
            periode
          };

          return this.loyerService.payerLoyer(data);
        }),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: res => {
          try {
            alert('Loyer payé avec succès !');

            console.log(`Resultat: ${JSON.stringify(res)}`);
            this.historiques.update(current => [res.transaction, ...current]);
            this.loyerForm.reset();
          } catch (err) {
            console.error(err);
          }
        },
        error: err => {
          console.error(err);
          alert('Erreur lors du paiement');
        }
      });
  }

  getHistoriqueLoyer(page: number) {
    this.loaderService.show();

    this.loyerService.obtenirMesHistoriqueLoyers(
      page,
      this.historiquePagination.limit
    )
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.historiques.set(res.loyers);

            logSafe(`Pagination: ${JSON.stringify(res.pagination)}`);
            this.historiquePagination.setTotalPages(res.pagination.totalPages);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  telechargerRecepisse(idTransaction: string) {
    this.loaderService.show();
    
    this.loyerService.obtenirRecepisse(idTransaction)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: res => {
          try {
            const r = res.recepisse;

            const dateEmission = new Date(r.dateEmission);
            const formattedDateEmission = `${ String(dateEmission.getDate()).padStart(2, '0') }/${String(dateEmission.getMonth() + 1).padStart(2, '0')}/${dateEmission.getFullYear()}`

            const docDefinition: TDocumentDefinitions = {
              content: [
                { text: 'REÇU DE PAIEMENT', style: 'header' },
                { text: `Numéro: ${r.numeroRecepisse}`, alignment: 'right' },
                { text: `Date d'émission: ${formattedDateEmission}`, alignment: 'right' },
                '\n',
                { text: 'Informations du donneur:', bold: true },
                `Nom: ${r.donneur.nom} ${r.donneur.prenoms}`,
                `Email: ${r.donneur.email}`,
                '\n',
                { text: 'Informations du receveur:', bold: true },
                `Nom: ${r.receveur.nom} ${r.receveur.prenoms}`,
                `Email: ${r.receveur.email}`,
                '\n',
                {
                  table: {
                    widths: ['*', 'auto'],
                    body: [
                      ['Description', 'Montant'],
                      [r.description, `${r.montant.toLocaleString()} Ar`],
                      ['Période', r.periode],
                      [{ text: 'Total', bold: true }, { text: `${r.montant.toLocaleString()} Ar`, bold: true }]
                    ]
                  },
                  layout: 'lightHorizontalLines'
                },
                '\n',
                { text: 'Merci pour votre paiement !', italics: true, alignment: 'center' }
              ],
              styles: {
                header: { fontSize: 18, bold: true, alignment: 'center' }
              },
              defaultStyle: { fontSize: 12 }
            };

            // GÃ©nÃ©rer et tÃ©lÃ©charger le PDF
            pdfMake.createPdf(docDefinition).download(`recepisse-${r.numeroRecepisse}.pdf`);
          } catch (err) {
            console.error(err);
          }
        },
        error: err => {
        console.error(err);
        alert('Impossible de générer le reçu.');
      }
      });
  }
}


