import { CurrencyPipe, DatePipe, DecimalPipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { Loader } from "../../../components/shared/loader/loader";
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { EspacesStatsResponse } from '../../../core/models/admin/espaces.model';
import { BoutiqueStatsResponse, StatutBoutique } from '../../../core/models/commercant/boutique.model';
import { Recepisse } from '../../../core/models/recepisse.model';
import { LoyerStats } from '../../../core/models/commercant/commercant.model';
import { EspacesService } from '../../../core/services/admin/espaces.service';
import { BoutiqueService } from '../../../core/services/commercant/boutique.service';
import { LoyerService } from '../../../core/services/admin/loyer.service';

interface PaiementsMoisCourantResponse {
  periode: string;
  moisCourant: {
    annee: number;
    mois: number;
    nomMois: string;
  };
  boutiquesPayees: {
    _id: string;
    nom: string;
    montantPaye: number;
    datePaiement: string;
    numeroRecepisse: string;
    statut: string;
  }[];
  boutiquesImpayees: {
    _id: string;
    nom: string;
    montantDu: number;
    statut: string;
  }[];
  statistiques: {
    nombreBoutiquesActives: number;
    nombreBoutiquesPayees: number;
    nombreBoutiquesImpayees: number;
    totalEncaisse: number;
    totalMontantDu: number;
    tauxPaiement: number;
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, Loader, DecimalPipe, CurrencyPipe, DatePipe, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  static {
    Chart.register(...registerables);
  }

  isLoading = signal(false);

  espaceStats = signal<EspacesStatsResponse>({
    totalEspaces: 0,
    espacesDisponibles: 0,
    espacesOccupes: 0,
    tauxOccupation: 0
  });

  boutiqueStats = signal<BoutiqueStatsResponse>({
    total: 0,
    parStatut: [],
    parCategorie: []
  });

  statutPaiementMois = signal<PaiementsMoisCourantResponse | null>(null);
  historiqueLoyers = signal<Recepisse[]>([]);
  historiqueStats = signal<LoyerStats>({
    totalMontant: 0,
    nombrePaiements: 0,
    montantMoyen: 0,
    montantMin: 0,
    montantMax: 0
  });

  periodeStats = signal<LoyerStats>({
    totalMontant: 0,
    nombrePaiements: 0,
    montantMoyen: 0,
    montantMin: 0,
    montantMax: 0
  });

  selectedMonth = signal<string>('');
  selectedYear = signal<string>('');

  readonly monthOptions = [
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

  readonly yearOptions = this.buildYearOptions();

  espaceOccupationChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Disponibles', 'Occupés'],
    datasets: [{ data: [0, 0], backgroundColor: ['#22c55e', '#ef4444'] }]
  };

  boutiqueStatutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Actives', 'Inactives'],
    datasets: [{ data: [0, 0], backgroundColor: ['#0d6efd', '#6c757d'] }]
  };

  paiementMoisChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Deja payé', 'Pas encore'],
    datasets: [{ data: [0, 0], backgroundColor: ['#20c997', '#fd7e14'] }]
  };

  categoriesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Boutiques', backgroundColor: '#0d6efd' }]
  };

  loyerPeriodeChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Montant encaissé',
        fill: true,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        tension: 0.3
      }
    ]
  };

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  readonly lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true }
    }
  };

  readonly StatutBoutique = StatutBoutique;

  constructor(
    private espacesService: EspacesService,
    private boutiqueService: BoutiqueService,
    private loyerService: LoyerService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const selectedMonth = String(now.getMonth() + 1).padStart(2, '0');
    const selectedYear = String(now.getFullYear());
    console.log(`Current Selected month: ${selectedMonth}, Selected year: ${selectedYear}`);

    this.selectedMonth.set(selectedMonth);
    this.selectedYear.set(selectedYear);
    this.loadDashboard();
  }

  loadDashboard() {
    const now = new Date();
    const mois = String(now.getMonth() + 1).padStart(2, '0');
    const annee = String(now.getFullYear());

    this.isLoading.set(true);

    forkJoin({
      espaceStats: this.espacesService.getEspaceStats(),
      boutiqueStats: this.boutiqueService.getBoutiqueStats(),
      statutPaiementMois: this.loyerService.getStatutPaimentsMoisCourant(),
      historiqueLoyers: this.loyerService.obtenirHistoriqueLoyers(mois, annee, 1, 6)
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const espStats = res.espaceStats;
          console.log(`Espace Stats: ${JSON.stringify(espStats)}`);
          this.espaceStats.set(res.espaceStats);

          const btqStats = res.boutiqueStats;
          console.log(`Boutique Stats: ${JSON.stringify(btqStats)}`);
          this.boutiqueStats.set(btqStats);

          this.statutPaiementMois.set(res.statutPaiementMois as PaiementsMoisCourantResponse);
          this.historiqueLoyers.set(res.historiqueLoyers.loyers);
          this.historiqueStats.set(res.historiqueLoyers.statistiques);
          this.buildDashboardCharts();
          this.buildLoyerPeriodeChart(res.historiqueLoyers.loyers, mois, annee);
          this.periodeStats.set(res.historiqueLoyers.statistiques);
        },
        error: console.error
      });
  }

  onMonthChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedMonth.set(value);
  }

  onYearChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedYear.set(value);
  }

  loadHistoriqueParPeriode() {
    const mois = this.selectedMonth();
    const annee = this.selectedYear();
    if (!mois || !annee) return;

    this.isLoading.set(true);
    this.loyerService.obtenirHistoriqueLoyers(mois, annee, 1, 200)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.buildLoyerPeriodeChart(res.loyers, mois, annee);
          this.periodeStats.set(res.statistiques);
        },
        error: console.error
      });
  }

  getBoutiqueCountByStatut(statut: StatutBoutique): number {
    const match = this.boutiqueStats().parStatut.find(s => s.statutBoutique === statut);
    return match?.count ?? 0;
  }

  getCategoriePart(count: number): number {
    const total = this.boutiqueStats().total;
    if (!total) return 0;
    return (count / total) * 100;
  }

  getPaiementProgressType(): string {
    const taux = this.statutPaiementMois()?.statistiques.tauxPaiement ?? 0;
    if (taux >= 75) return 'bg-success';
    if (taux >= 45) return 'bg-warning';
    return 'bg-danger';
  }

  private buildDashboardCharts() {
    const statsEspace = this.espaceStats();
    const actives = this.getBoutiqueCountByStatut(StatutBoutique.Actif);
    const inactives = this.getBoutiqueCountByStatut(StatutBoutique.Inactif);
    const paiementStats = this.statutPaiementMois()?.statistiques;

    this.espaceOccupationChartData = {
      labels: ['Disponibles', 'Occupes'],
      datasets: [{
        data: [statsEspace.espacesDisponibles, statsEspace.espacesOccupes],
        backgroundColor: ['#22c55e', '#ef4444']
      }]
    };

    this.boutiqueStatutChartData = {
      labels: ['Actives', 'Inactives'],
      datasets: [{
        data: [actives, inactives],
        backgroundColor: ['#0d6efd', '#6c757d']
      }]
    };

    this.paiementMoisChartData = {
      labels: ['Deja payé', 'Pas encore'],
      datasets: [{
        data: [
          paiementStats?.nombreBoutiquesPayees ?? 0,
          paiementStats?.nombreBoutiquesImpayees ?? 0
        ],
        backgroundColor: ['#20c997', '#fd7e14']
      }]
    };

    this.categoriesChartData = {
      labels: this.boutiqueStats().parCategorie.map(item => item.categorie),
      datasets: [{
        data: this.boutiqueStats().parCategorie.map(item => item.count),
        label: 'Boutiques',
        backgroundColor: '#0d6efd'
      }]
    };
  }

  private buildLoyerPeriodeChart(loyers: Recepisse[], mois: string, annee: string) {
    const monthIndex = Number(mois) - 1;
    const yearNumber = Number(annee);
    const daysInMonth = new Date(yearNumber, monthIndex + 1, 0).getDate();
    const totalsByDay = Array.from({ length: daysInMonth }, () => 0);

    loyers.forEach((ligne) => {
      const date = new Date(ligne.dateEmission);
      if (date.getMonth() === monthIndex && date.getFullYear() === yearNumber) {
        const day = date.getDate();
        totalsByDay[day - 1] += ligne.montant;
      }
    });

    this.loyerPeriodeChartData = {
      labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
      datasets: [
        {
          data: totalsByDay,
          label: `Montant encaissé - ${mois}/${annee}`,
          fill: true,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.2)',
          tension: 0.3
        }
      ]
    };
  }

  private buildYearOptions(): string[] {
    const year = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(year - 1 + i));
  }

}
