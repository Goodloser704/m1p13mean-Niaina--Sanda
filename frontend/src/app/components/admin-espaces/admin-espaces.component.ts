import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspaceService } from '../../services/espace.service';
import { EtageService } from '../../services/etage.service';
import { BoutiqueService } from '../../services/boutique.service';
import { Espace, EspaceRequest, EspaceFilters, Boutique } from '../../models/api-models';

@Component({
  selector: 'app-admin-espaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-espaces.component.html',
  styleUrl: './admin-espaces.component.scss'
})
export class AdminEspacesComponent implements OnInit {
  // État des données
  espaces: Espace[] = [];
  etages: Array<{ numero: number; nom: string }> = [];
  boutiques: Boutique[] = [];
  loading = false;
  error = '';
  success = '';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Filtres
  filters: EspaceFilters = {
    page: 1,
    limit: 20
  };

  // Modal et formulaire
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedEspace: Espace | null = null;

  // Formulaire
  espaceForm: EspaceRequest = {
    codeEspace: '',
    surface: 0,
    etage: 0,
    loyer: 0,
    statut: 'Disponible',
    description: '',
    caracteristiques: {
      vitrine: false,
      climatisation: false,
      stockage: false,
      accesPMR: false
    }
  };

  // Statistiques
  stats: any = null;
  showStats = false;

  // Vue
  viewMode: 'grid' | 'table' = 'grid';

  constructor(
    private espaceService: EspaceService,
    private etageService: EtageService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit() {
    // Test de connectivité d'abord
    this.testerConnectivite();
    this.chargerDonneesInitiales();
  }

  // Test de connectivité
  async testerConnectivite() {
    console.log('🧪 Test de connectivité espaces...');
    try {
      const response = await this.espaceService.testerConnexion().toPromise();
      console.log('✅ Test connectivité espaces réussi:', response);
    } catch (error) {
      console.error('❌ Test connectivité espaces échoué:', error);
    }
  }

  async chargerDonneesInitiales() {
    this.loading = true;
    this.error = '';
    
    try {
      await Promise.all([
        this.chargerEspaces(),
        this.chargerEtages(),
        this.chargerBoutiques(),
        this.chargerStatistiques()
      ]);
    } catch (error) {
      console.error('❌ Erreur chargement données initiales:', error);
      this.error = 'Erreur lors du chargement des données';
    } finally {
      this.loading = false;
    }
  }

  // Chargement des données
  async chargerEspaces() {
    console.log('🏪 Chargement des espaces - Page:', this.currentPage, 'Filtres:', this.filters);
    // Ne pas gérer loading ici car c'est géré par chargerDonneesInitiales
    this.error = '';

    try {
      this.filters.page = this.currentPage;
      const response = await this.espaceService.obtenirEspaces(this.filters).toPromise();

      if (response) {
        console.log('✅ Espaces chargés:', response.espaces.length);
        this.espaces = response.espaces;
        this.total = response.total;
        this.totalPages = response.totalPages;
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement espaces:', error);
      this.error = error.error?.message || 'Erreur lors du chargement des espaces';
      throw error; // Propager l'erreur pour que Promise.all la capture
    }
  }

  async chargerEtages() {
    console.log('🏢 Chargement liste des étages');
    try {
      const etages = await this.etageService.obtenirListeEtages().toPromise();
      if (etages) {
        console.log('✅ Étages chargés:', etages.length);
        this.etages = etages;
      }
    } catch (error) {
      console.error('❌ Erreur chargement étages:', error);
    }
  }

  async chargerBoutiques() {
    console.log('🏪 Chargement liste des boutiques');
    try {
      const response = await this.boutiqueService.obtenirBoutiques().toPromise();
      if (response) {
        console.log('✅ Boutiques chargées:', response.boutiques.length);
        this.boutiques = response.boutiques;
      }
    } catch (error) {
      console.error('❌ Erreur chargement boutiques:', error);
    }
  }

  async chargerStatistiques() {
    console.log('📊 Chargement des statistiques espaces');
    try {
      const response = await this.espaceService.obtenirStatistiques().toPromise();
      if (response) {
        console.log('✅ Statistiques espaces chargées:', response.stats);
        this.stats = response.stats;
      }
    } catch (error) {
      console.error('❌ Erreur chargement statistiques espaces:', error);
    }
  }

  // Filtrage
  async appliquerFiltres() {
    this.currentPage = 1;
    this.loading = true;
    try {
      await this.chargerEspaces();
    } finally {
      this.loading = false;
    }
  }

  async reinitialiserFiltres() {
    this.filters = {
      page: 1,
      limit: 20
    };
    this.currentPage = 1;
    this.loading = true;
    try {
      await this.chargerEspaces();
    } finally {
      this.loading = false;
    }
  }

  // Gestion du modal
  ouvrirModal(mode: 'create' | 'edit', espace?: Espace) {
    this.modalMode = mode;
    this.selectedEspace = espace || null;
    
    if (mode === 'create') {
      this.espaceForm = {
        codeEspace: '',
        surface: 0,
        etage: this.etages.length > 0 ? this.etages[0].numero : 0,
        loyer: 0,
        statut: 'Disponible',
        description: '',
        caracteristiques: {
          vitrine: false,
          climatisation: false,
          stockage: false,
          accesPMR: false
        }
      };
    } else if (espace) {
      this.espaceForm = {
        codeEspace: espace.codeEspace,
        surface: espace.surface,
        etage: espace.etage,
        loyer: espace.loyer,
        statut: espace.statut,
        description: espace.description || '',
        caracteristiques: { ...espace.caracteristiques }
      };
    }
    
    this.showModal = true;
    this.error = '';
    this.success = '';
  }

  fermerModal() {
    this.showModal = false;
    this.selectedEspace = null;
    this.error = '';
    this.success = '';
  }

  // Soumission du formulaire
  async soumettre() {
    if (!this.validerFormulaire()) return;

    this.loading = true;
    this.error = '';

    try {
      if (this.modalMode === 'create') {
        await this.espaceService.creerEspace(this.espaceForm).toPromise();
        this.success = 'Espace créé avec succès';
      } else if (this.selectedEspace) {
        await this.espaceService.mettreAJourEspace(this.selectedEspace._id, this.espaceForm).toPromise();
        this.success = 'Espace mis à jour avec succès';
      }

      await this.chargerEspaces();
      await this.chargerStatistiques();
      
      setTimeout(() => {
        this.fermerModal();
      }, 1500);

    } catch (error: any) {
      this.error = error.error?.message || 'Erreur lors de la sauvegarde';
      console.error('Erreur sauvegarde espace:', error);
    } finally {
      this.loading = false;
    }
  }

  // Actions sur les espaces
  async supprimerEspace(espace: Espace) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${espace.codeEspace}" ?`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.espaceService.supprimerEspace(espace._id).toPromise();
      this.success = 'Espace supprimé avec succès';
      await this.chargerEspaces();
      await this.chargerStatistiques();
      
      setTimeout(() => {
        this.success = '';
      }, 3000);

    } catch (error: any) {
      this.error = error.error?.message || 'Erreur lors de la suppression';
      console.error('Erreur suppression espace:', error);
    } finally {
      this.loading = false;
    }
  }

  async libererEspace(espace: Espace) {
    if (!confirm(`Êtes-vous sûr de vouloir libérer l'espace "${espace.codeEspace}" ?`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.espaceService.libererEspace(espace._id).toPromise();
      this.success = 'Espace libéré avec succès';
      await this.chargerEspaces();
      await this.chargerStatistiques();
      
      setTimeout(() => {
        this.success = '';
      }, 3000);

    } catch (error: any) {
      this.error = error.error?.message || 'Erreur lors de la libération';
      console.error('Erreur libération espace:', error);
    } finally {
      this.loading = false;
    }
  }

  // Validation
  validerFormulaire(): boolean {
    if (!this.espaceForm.codeEspace.trim()) {
      this.error = 'Le code espace est requis';
      return false;
    }

    if (this.espaceForm.surface <= 0) {
      this.error = 'La surface doit être supérieure à 0';
      return false;
    }

    if (this.espaceForm.loyer < 0) {
      this.error = 'Le loyer ne peut pas être négatif';
      return false;
    }

    return true;
  }

  // Pagination
  async changerPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loading = true;
      try {
        await this.chargerEspaces();
      } finally {
        this.loading = false;
      }
    }
  }

  // Utilitaires
  obtenirPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  changerVue(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  formaterLoyer(loyer: number): string {
    return this.espaceService.formaterLoyer(loyer);
  }

  formaterSurface(surface: number): string {
    return this.espaceService.formaterSurface(surface);
  }

  calculerPrixParM2(espace: Espace): number {
    return this.espaceService.calculerPrixParM2(espace);
  }

  obtenirCouleurStatut(statut: string): string {
    return this.espaceService.obtenirCouleurStatut(statut);
  }

  obtenirIconeStatut(statut: string): string {
    return this.espaceService.obtenirIconeStatut(statut);
  }

  obtenirNomEtage(numeroEtage: number): string {
    const etage = this.etages.find(e => e.numero === numeroEtage);
    return etage ? etage.nom : `Étage ${numeroEtage}`;
  }

  obtenirNomBoutique(espace: Espace): string {
    if (espace.statut === 'Disponible') return 'Libre';
    if (typeof espace.boutique === 'object' && espace.boutique) {
      return espace.boutique.nom;
    }
    return 'Occupé';
  }
}