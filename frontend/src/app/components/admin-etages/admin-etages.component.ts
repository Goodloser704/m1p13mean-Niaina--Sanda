import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtageService } from '../../services/etage.service';
import { Etage, EtageRequest } from '../../models/api-models';

@Component({
  selector: 'app-admin-etages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-etages.component.html',
  styleUrl: './admin-etages.component.scss'
})
export class AdminEtagesComponent implements OnInit {
  // État des données
  etages: Etage[] = [];
  loading = false;
  error = '';
  success = '';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Modal et formulaire
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedEtage: Etage | null = null;

  // Formulaire
  etageForm: EtageRequest = {
    numero: 0,
    nom: '',
    description: ''
  };

  // Statistiques
  stats: any = null;
  showStats = false;

  constructor(private etageService: EtageService) {}

  ngOnInit() {
    // Test de connectivité d'abord
    this.testerConnectivite();
    this.chargerEtages();
    this.chargerStatistiques();
  }

  // Test de connectivité
  async testerConnectivite() {
    console.log('🧪 Test de connectivité étages...');
    try {
      const response = await this.etageService.testerConnexion().toPromise();
      console.log('✅ Test connectivité étages réussi:', response);
    } catch (error) {
      console.error('❌ Test connectivité étages échoué:', error);
    }
  }

  // Chargement des données
  async chargerEtages() {
    console.log('🏢 Chargement des étages - Page:', this.currentPage);
    this.loading = true;
    this.error = '';

    try {
      const response = await this.etageService.obtenirEtages({
        page: this.currentPage,
        limit: 20
      }).toPromise();

      if (response) {
        console.log('✅ Étages chargés:', response.etages.length);
        this.etages = response.etages;
        this.total = response.total;
        this.totalPages = response.totalPages;
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement étages:', error);
      this.error = 'Erreur lors du chargement des étages';
    } finally {
      this.loading = false;
    }
  }

  async chargerStatistiques() {
    console.log('📊 Chargement des statistiques étages');
    try {
      const response = await this.etageService.obtenirStatistiques().toPromise();
      if (response) {
        console.log('✅ Statistiques étages chargées:', response.stats);
        this.stats = response.stats;
      }
    } catch (error) {
      console.error('❌ Erreur chargement statistiques étages:', error);
    }
  }

  // Gestion du modal
  ouvrirModal(mode: 'create' | 'edit', etage?: Etage) {
    this.modalMode = mode;
    this.selectedEtage = etage || null;
    
    if (mode === 'create') {
      this.etageForm = {
        numero: 0,
        nom: '',
        description: ''
      };
    } else if (etage) {
      this.etageForm = {
        numero: etage.numero,
        nom: etage.nom,
        description: etage.description || ''
      };
    }
    
    this.showModal = true;
    this.error = '';
    this.success = '';
  }

  fermerModal() {
    this.showModal = false;
    this.selectedEtage = null;
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
        await this.etageService.creerEtage(this.etageForm).toPromise();
        this.success = 'Étage créé avec succès';
      } else if (this.selectedEtage) {
        await this.etageService.mettreAJourEtage(this.selectedEtage._id, this.etageForm).toPromise();
        this.success = 'Étage mis à jour avec succès';
      }

      await this.chargerEtages();
      await this.chargerStatistiques();
      
      setTimeout(() => {
        this.fermerModal();
      }, 1500);

    } catch (error: any) {
      this.error = error.error?.message || 'Erreur lors de la sauvegarde';
      console.error('Erreur sauvegarde étage:', error);
    } finally {
      this.loading = false;
    }
  }

  // Suppression
  async supprimerEtage(etage: Etage) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'étage "${etage.nom}" ?`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.etageService.supprimerEtage(etage._id).toPromise();
      this.success = 'Étage supprimé avec succès';
      await this.chargerEtages();
      await this.chargerStatistiques();
      
      setTimeout(() => {
        this.success = '';
      }, 3000);

    } catch (error: any) {
      this.error = error.error?.message || 'Erreur lors de la suppression';
      console.error('Erreur suppression étage:', error);
    } finally {
      this.loading = false;
    }
  }

  // Validation
  validerFormulaire(): boolean {
    if (!this.etageForm.nom.trim()) {
      this.error = 'Le nom de l\'étage est requis';
      return false;
    }

    if (this.etageForm.numero === undefined || this.etageForm.numero === null) {
      this.error = 'Le numéro d\'étage est requis';
      return false;
    }

    return true;
  }

  // Pagination
  changerPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.chargerEtages();
    }
  }

  // Utilitaires
  obtenirPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  formaterNombreEspaces(etage: Etage): string {
    const total = etage.nombreEspaces || 0;
    const disponibles = etage.espacesDisponibles || 0;
    const occupes = etage.espacesOccupes || 0;
    
    return `${total} espaces (${disponibles} libres, ${occupes} occupés)`;
  }
}