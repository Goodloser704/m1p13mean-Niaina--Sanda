import { Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BoutiqueService } from '../../../../core/services/commercant/boutique.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { FormsModule } from '@angular/forms';
import { PorteFeuilleService } from '../../../../core/services/porte-feuille.service';
import { LoyerService } from '../../../../core/services/admin/loyer.service';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { PaginationComponent } from "../../../../components/shared/pagination-component/pagination-component";
import { createPagination } from '../../../../core/functions/pagination-function';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { finalize } from 'rxjs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
(pdfMake as any).vfs = pdfFonts['vfs'];

interface MoisCalendrier {
  annee: number;
  mois: number;
  label: string;
  periode: string;
  estPasse: boolean;
  estCourant: boolean;
  estFutur: boolean;
}

interface StatutPaiementBoutique {
  boutiqueId: string;
  periode: string;
  estPaye: boolean;
}

@Component({
  selector: 'app-loyers',
  imports: [CurrencyPipe, DatePipe, FormsModule, NgClass, PaginationComponent],
  templateUrl: './loyers.html',
  styleUrl: './loyers.scss',
})
export class Loyers implements OnInit {
  loyerService = inject(LoyerService);
  boutiqueService = inject(BoutiqueService);
  portefeuilleService = inject(PorteFeuilleService);
  loaderService = inject(LoaderService);

  boutiques = signal<any[]>([]);
  boutiquesSelectionnees = signal<Set<string>>(new Set());
  
  soldePortefeuille = signal<number>(0);

  historiquePaiements = signal<any[]>([]);
  historiquePagination = createPagination(10);

  moisCalendrier = signal<MoisCalendrier[]>([]);
  moisSelectionnes = signal<Set<string>>(new Set());
  
  // Map pour stocker le statut de paiement par boutique et période
  statutsPaiements = signal<Map<string, boolean>>(new Map());
  
  // Exposer Array.from pour le template
  Array = Array;
  
  montantTotal = computed(() => {
    const selectedIds = this.boutiquesSelectionnees();
    const selectedMoisCount = this.moisSelectionnes().size;

    if (!selectedIds.size || !selectedMoisCount) return 0;

    return this.boutiques()
      .filter(b => selectedIds.has(b._id))
      .reduce((total, b) => total + (b.espace?.loyer ?? 0) * selectedMoisCount, 0);
  });

  @ViewChild('historiqueSection') historiqueSection!: ElementRef;
  @ViewChild('paiementSection') paiementSection!: ElementRef;

  constructor() {
    effect(() => {
      const page = this.historiquePagination.currentPage();

      this.getHistoriques(page);
    })
  }

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees() {
    this.loaderService.show();
    
    // Récupérer la boutique en cours depuis le service
    const boutiqueEnCours = this.boutiqueService.currentBoutique();
    
    if (!boutiqueEnCours) {
      alert('Aucune boutique sélectionnée');
      this.loaderService.hide();
      return;
    }
    
    // Charger uniquement la boutique en cours avec ses détails complets
    this.boutiqueService.getMyBoutique(boutiqueEnCours._id).subscribe({
      next: (res: any) => {
        const boutique = res.boutique;
        
        // Vérifier que la boutique a un espace et est active
        if (boutique && boutique.espace) {
          this.boutiques.set([boutique]);
          
          // Sélectionner automatiquement cette boutique
          this.boutiquesSelectionnees.set(new Set([boutique._id]));
          
          console.log('✅ Boutique chargée:', boutique.nom, 'Loyer:', boutique.espace?.loyer);
          
          // Charger le reste des données APRÈS avoir chargé la boutique
          this.chargerSolde();
        } else {
          this.boutiques.set([]);
          alert('Cette boutique n\'a pas d\'espace loué');
          this.loaderService.hide();
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement boutique:', err);
        this.loaderService.hide();
      }
    });
  }
  
  chargerSolde() {
    // Charger le solde
    this.portefeuilleService.obtenirSolde().subscribe({
      next: (res: any) => {
        const balance = res.portefeuille?.balance ?? res.balance ?? 0;
        this.soldePortefeuille.set(balance);
      },
      error: (err: any) => console.error('Erreur chargement solde:', err)
    });
  }

  getHistoriques(page: number) {
    this.loyerService.obtenirHistorique({
      page,
      limit: this.historiquePagination.limit
    }).subscribe({
      next: (res) => {
        this.historiquePaiements.set(res.loyers);
        this.historiquePagination.setTotalPages(res.pagination.totalPages);
        this.historiquePagination.setTotalItems(res.pagination.total);

        this.genererCalendrier();
      },
      error: (err) => console.error('Erreur chargement historique:', err),
      complete: () => this.loaderService.hide()
    });
  }

  genererCalendrier() {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();

    const paiementsMap = new Map<string, boolean>();

    for (const h of this.historiquePaiements()) {
      const matchPeriode = h.description?.match(/Période (\d{4}-\d{2})/);
      const matchBoutique = h.description?.match(/Loyer boutique (.+?) - Période/);

      if (!matchPeriode || !matchBoutique) continue;

      const periode = matchPeriode[1];
      const nomBoutique = matchBoutique[1].trim();

      const boutique = this.boutiques().find(b => b.nom === nomBoutique);
      if (!boutique) continue;

      paiementsMap.set(`${boutique._id}-${periode}`, true);
    }

    this.statutsPaiements.set(paiementsMap);

    const calendrier: MoisCalendrier[] = [];

    for (let i = -6; i <= 12; i++) {
      const date = new Date(anneeActuelle, moisActuel + i, 1);

      calendrier.push({
        annee: date.getFullYear(),
        mois: date.getMonth() + 1,
        periode: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        estPasse: i < 0,
        estCourant: i === 0,
        estFutur: i > 0
      });
    }

    this.moisCalendrier.set(calendrier);
  }

  toggleBoutique(boutiqueId: string) {
    const selected = new Set(this.boutiquesSelectionnees());
    selected.has(boutiqueId)
      ? selected.delete(boutiqueId)
      : selected.add(boutiqueId);

    this.boutiquesSelectionnees.set(selected);
  }

  toggleMois(periode: string) {
    const boutiquesIds = Array.from(this.boutiquesSelectionnees());

    if (
      boutiquesIds.length &&
      boutiquesIds.every(id => this.estPayePourBoutique(id, periode))
    ) {
      alert(`Toutes les boutiques sélectionnées ont déjà payé pour cette période.`);
      return;
    }

    const selected = new Set(this.moisSelectionnes());
    selected.has(periode)
      ? selected.delete(periode)
      : selected.add(periode);

    this.moisSelectionnes.set(selected);

    // setTimeout(() => {
    //   this.paiementSection?.nativeElement.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'start'
    //   });
    // }, 300);
  }
  
  selectionnerMoisPourBoutique(boutiqueId: string, periode: string) {
    if (!this.estPayePourBoutique(boutiqueId, periode)) {
      this.toggleBoutique(boutiqueId);
      this.toggleMois(periode);
    }
  }
  
  estPayePourBoutique(boutiqueId: string, periode: string): boolean {
    const key = `${boutiqueId}-${periode}`;
    return this.statutsPaiements().get(key) || false;
  }
  
  getNombreBoutiquesPayees(periode: string): number {
    const boutiques = this.boutiques();
    return boutiques.filter(b => this.estPayePourBoutique(b._id, periode)).length;
  }
  
  getNombreBoutiquesImpayees(periode: string): number {
    const boutiques = this.boutiques();
    return boutiques.filter(b => !this.estPayePourBoutique(b._id, periode)).length;
  }
  
  toutesLesBoutiquesSelectionneesSontPayees(periode: string): boolean {
    const boutiquesSelectionnees = Array.from(this.boutiquesSelectionnees());
    if (boutiquesSelectionnees.length === 0) return false;
    
    return boutiquesSelectionnees.every(
      boutiqueId => this.estPayePourBoutique(boutiqueId, periode)
    );
  }

  selectionnerToutesBoutiques() {
    const ids = new Set(this.boutiques().map(b => b._id));
    this.boutiquesSelectionnees.set(ids);
  }

  deselectionnerToutesBoutiques() {
    this.boutiquesSelectionnees.set(new Set());
  }

  payerLoyers() {
    const boutiquesIds = Array.from(this.boutiquesSelectionnees());
    const periodes = Array.from(this.moisSelectionnes());

    if (!boutiquesIds.length) {
      alert('Veuillez sélectionner au moins une boutique');
      return;
    }

    if (!periodes.length) {
      alert('Veuillez sélectionner au moins un mois');
      return;
    }

    const paiements = boutiquesIds.flatMap(boutiqueId =>
      periodes
        .filter(p => !this.estPayePourBoutique(boutiqueId, p))
        .map(periode => {
          const boutique = this.boutiques().find(b => b._id === boutiqueId);
          return {
            boutiqueId,
            periode,
            montant: boutique?.espace?.loyer ?? 0
          };
        })
    );

    if (!paiements.length) {
      alert('Tous les loyers sélectionnés ont déjà été payés.');
      return;
    }

    const montantTotal = paiements.reduce((sum, p) => sum + p.montant, 0);
    const solde = this.soldePortefeuille();

    if (montantTotal > solde) {
      alert(`Solde insuffisant.
        Vous avez : ${solde.toFixed(2)}Ar
         Montant requis : ${montantTotal.toFixed(2)}Ar
      `);
      return;
    }

    if (!confirm(`Confirmer le paiement de ${montantTotal.toFixed(2)}Ar ?`)) return;

    this.loaderService.show();

    let completed = 0;

    for (const paiement of paiements) {
      this.loyerService.payerLoyer(paiement).subscribe({
        next: () => {
          completed++;
          if (completed === paiements.length) {
            this.loaderService.hide();
            alert(`${completed} loyer(s) payé(s) avec succès.`);
            this.chargerDonnees();
            this.moisSelectionnes.set(new Set());
          }
        },
        error: (err) => {
          this.loaderService.hide();
          alert(err.error?.message || 'Erreur lors du paiement');
        }
      });
    }
  }

  getBadgeClass(mois: MoisCalendrier): string {
    if (mois.estCourant) return 'badge-warning';
    if (mois.estPasse) return 'badge-danger';
    return 'badge-secondary';
  }

  getMoisLabel(mois: MoisCalendrier): string {
    if (mois.estCourant) return 'Mois courant';
    if (mois.estPasse) return 'Passé';
    return 'À venir';
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
