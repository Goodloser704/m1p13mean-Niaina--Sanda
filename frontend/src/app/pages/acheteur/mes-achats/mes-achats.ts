import { AfterViewInit, Component, effect, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { createPagination } from '../../../core/functions/pagination-function';
import { Achat, EtatAchat, TypeAchat } from '../../../core/models/acheteur/achat.model';
import { Facture } from '../../../core/models/acheteur/facture.model';
import { AchatService } from '../../../core/services/acheteur/achat.service';
import { LoaderService } from '../../../core/services/loader.service';
import { finalize } from 'rxjs';
import { EmptyGridList } from "../../../components/shared/empty-grid-list/empty-grid-list";
import { AchatCard } from "../../../components/commercant/achat-card/achat-card";
import { PaginationComponent } from "../../../components/shared/pagination-component/pagination-component";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts['vfs'];

@Component({
  selector: 'app-mes-achats',
  imports: [EmptyGridList, AchatCard, PaginationComponent, DatePipe, CurrencyPipe],
  templateUrl: './mes-achats.html',
  styleUrl: './mes-achats.scss',
})
export class MesAchats implements OnInit, AfterViewInit {
  achatsEnAttente = signal<Achat[]>([]);
  achatsEnAttentePagination = createPagination(12);

  historiqueAchats = signal<Achat[]>([]);
  historiquePagination = createPagination(12);

  factures = signal<Facture[]>([]);
  facturesPagination = createPagination(12);

  TypeAchat = TypeAchat;
  filtreTypesAchats = signal<TypeAchat | undefined>(undefined);

  @ViewChild('childSection') childSection!: ElementRef;

  constructor(
    private achatService: AchatService,
    private loaderService: LoaderService
  ) {
    effect(() => {
      const page = this.achatsEnAttentePagination.currentPage();

      this.getAchatsEnAttente(page, [TypeAchat.Livrer, TypeAchat.Recuperer]);
    });

    effect(() => {
      const page = this.historiquePagination.currentPage();
      const typesAchat = this.filtreTypesAchats();

      if (typesAchat !== undefined) {
        this.getHistoriqueAchat(page, [typesAchat]);
      } else {
        this.getHistoriqueAchat(page, [TypeAchat.Livrer, TypeAchat.Recuperer]);
      }
    });

    effect(() => {
      const page = this.facturesPagination.currentPage();

      this.getMesFactures(page);
    })
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getAchatsEnAttente(page: number, typesAchat?: TypeAchat[]) {
    this.loaderService.show();

    this.achatService.getMesAchats({
      page: page,
      limit: this.achatsEnAttentePagination.limit,
      etatsAchat: [EtatAchat.EnAttente],
      typesAchat: typesAchat,
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(`${JSON.stringify(res)}`);

            this.achatsEnAttente.set(res.achats);
            this.achatsEnAttentePagination.setTotalPages(res.pagination.totalPages);
            this.achatsEnAttentePagination.setTotalItems(res.pagination.total);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  getHistoriqueAchat(page: number, typesAchat?: TypeAchat[]) {
    this.loaderService.show();

    this.achatService.getMesAchats({
      page: page,
      limit: this.historiquePagination.limit,
      etatsAchat: [EtatAchat.Validee],
      typesAchat: typesAchat,
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            console.log(`${JSON.stringify(res)}`);

            this.historiqueAchats.set(res.achats);
            this.historiquePagination.setTotalPages(res.pagination.totalPages);
            this.historiquePagination.setTotalItems(res.pagination.total);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      });
  }

  getMesFactures(page: number) {
    this.loaderService.show();

    this.achatService.getMesFactures({
      page: page,
      limit: this.facturesPagination.limit
    })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          try {
            this.factures.set(res.factures);
            this.facturesPagination.setTotalPages(res.pagination.totalPages);
            this.facturesPagination.setTotalItems(res.pagination.total);
          } catch (err) {
            console.error(err);
          }
        },
        error: console.error
      })
  }

  telechargerRecepisse(facture: Facture) {
    try {

      const dateEmission = new Date(facture.dateEmission);
      const formattedDate = `${String(dateEmission.getDate()).padStart(2, '0')}/${
        String(dateEmission.getMonth() + 1).padStart(2, '0')
      }/${dateEmission.getFullYear()}`;

      // 🔎 Parser description en lignes produits
      const lignes = facture.description.split('\n');

      const tableBody: any[] = [
        [
          { text: 'Produit', bold: true },
          { text: 'Qté', bold: true },
          { text: 'PU (Ar)', bold: true },
          { text: 'Total (Ar)', bold: true }
        ]
      ];

      lignes.forEach(line => {
        const produitMatch = line.match(/Produit:\s(.+?)\s\|/);
        const qteMatch = line.match(/Qté:\s(\d+)/);
        const puMatch = line.match(/PU:\s([\d.]+)/);

        if (produitMatch && qteMatch && puMatch) {
          const produit = produitMatch[1];
          const quantite = Number(qteMatch[1]);
          const pu = Number(puMatch[1]);
          const total = quantite * pu;

          tableBody.push([
            produit,
            quantite,
            pu.toLocaleString(),
            total.toLocaleString()
          ]);
        }
      });

      const docDefinition: TDocumentDefinitions = {
        content: [
          { text: 'REÇU / FACTURE', style: 'header' },

          {
            columns: [
              { text: `N° Facture: ${facture.numeroFacture}` },
              { text: `Date: ${formattedDate}`, alignment: 'right' }
            ]
          },

          '\n',

          { text: 'Client', bold: true },
          `Nom: ${facture.acheteur.nom} ${facture.acheteur.prenoms}`,
          `Email: ${facture.acheteur.email}`,

          '\n',

          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: tableBody
            },
            layout: 'lightHorizontalLines'
          },

          '\n',

          {
            columns: [
              { text: '' },
              {
                width: 'auto',
                table: {
                  body: [
                    ['Total HT', `${facture.montantTotal.toLocaleString()} Ar`],
                    [`TVA (${facture.tauxTVA}%)`, `${(facture.montantTTC - facture.montantTotal).toLocaleString()} Ar`],
                    [
                      { text: 'Total TTC', bold: true },
                      { text: `${facture.montantTTC.toLocaleString()} Ar`, bold: true }
                    ]
                  ]
                },
                layout: 'noBorders'
              }
            ]
          },

          '\n\n',

          {
            text: 'Merci pour votre confiance !',
            italics: true,
            alignment: 'center'
          }
        ],

        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          }
        },

        defaultStyle: {
          fontSize: 11
        }
      };

      pdfMake.createPdf(docDefinition)
        .download(`facture-${facture.numeroFacture}.pdf`);

    } catch (err) {
      console.error(err);
    }
  }
}
