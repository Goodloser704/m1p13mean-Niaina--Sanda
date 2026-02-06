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
    console.log('🏢 [FRONTEND-COMPONENT] === DEBUT ngOnInit ===');
    
    // Vérifier d'abord si l'utilisateur est connecté et a les bonnes permissions
    if (!this.isUserAuthenticated()) {
      console.log('❌ [FRONTEND-COMPONENT] Utilisateur non authentifié ou sans permissions admin');
      this.error = 'Vous devez être connecté en tant qu\'administrateur pour accéder à cette page.';
      return;
    }
    
    // Test de connectivité d'abord
    this.testerConnectivite();
    this.chargerEtages();
    this.chargerStatistiques();
    
    console.log('🏢 [FRONTEND-COMPONENT] === FIN ngOnInit ===');
  }

  // Vérifier l'authentification et les permissions
  private isUserAuthenticated(): boolean {
    // Cette méthode devrait vérifier si l'utilisateur est connecté et a le rôle admin
    // Pour l'instant, on va juste vérifier s'il y a un token
    const token = localStorage.getItem('mall_token') || sessionStorage.getItem('mall_token');
    const userStr = localStorage.getItem('mall_user') || sessionStorage.getItem('mall_user');
    
    if (!token || !userStr) {
      console.log('🔐 [FRONTEND-COMPONENT] Aucun token ou utilisateur trouvé');
      return false;
    }
    
    try {
      const user = JSON.parse(userStr);
      // Vérifier le rôle (accepter 'Admin' et 'admin')
      if (user.role !== 'Admin' && user.role !== 'admin') {
        console.log('🔐 [FRONTEND-COMPONENT] Utilisateur n\'est pas admin:', user.role);
        this.error = 'Seuls les administrateurs peuvent accéder à cette page.';
        return false;
      }
      
      console.log('✅ [FRONTEND-COMPONENT] Utilisateur admin authentifié:', user.email);
      return true;
    } catch (error) {
      console.error('❌ [FRONTEND-COMPONENT] Erreur parsing user data:', error);
      return false;
    }
  }

  // Test de connectivité
  async testerConnectivite() {
    console.log('🧪 [FRONTEND-COMPONENT] === DEBUT testerConnectivite ===');
    try {
      const response = await this.etageService.testerConnexion().toPromise();
      console.log('✅ [FRONTEND-COMPONENT] Test connectivité étages réussi:', response);
      console.log('🧪 [FRONTEND-COMPONENT] === FIN testerConnectivite (SUCCESS) ===');
    } catch (error: any) {
      console.error('❌ [FRONTEND-COMPONENT] Test connectivité étages échoué:', error);
      console.error('❌ [FRONTEND-COMPONENT] Type d\'erreur:', typeof error);
      
      // Afficher un message d'erreur convivial à l'utilisateur
      const friendlyMessage = error.friendlyMessage || 
                             error.error?.message || 
                             'Erreur de connexion au serveur';
      
      this.error = friendlyMessage;
      
      // Si c'est une erreur d'authentification, ne pas continuer le chargement
      if (error.status === 401 || error.error?.code === 'AUTH_EXPIRED') {
        console.log('🚨 [FRONTEND-COMPONENT] Erreur d\'authentification détectée - Arrêt du chargement');
        return;
      }
      
      console.log('🧪 [FRONTEND-COMPONENT] === FIN testerConnectivite (ERROR) ===');
    }
  }

  // Chargement des données
  async chargerEtages() {
    console.log('🏢 [FRONTEND-COMPONENT] === DEBUT chargerEtages ===');
    console.log('🏢 [FRONTEND-COMPONENT] Page courante:', this.currentPage);
    this.loading = true;
    this.error = '';

    try {
      const options = {
        page: this.currentPage,
        limit: 20
      };
      console.log('🏢 [FRONTEND-COMPONENT] Options de requête:', options);
      
      const response = await this.etageService.obtenirEtages(options).toPromise();

      if (response) {
        console.log('✅ [FRONTEND-COMPONENT] Étages chargés:', response.etages.length);
        console.log('🏢 [FRONTEND-COMPONENT] Réponse complète:', response);
        this.etages = response.etages;
        this.total = response.total;
        this.totalPages = response.totalPages;
        console.log('🏢 [FRONTEND-COMPONENT] État mis à jour - Total:', this.total, 'Pages:', this.totalPages);
      }
      console.log('🏢 [FRONTEND-COMPONENT] === FIN chargerEtages (SUCCESS) ===');
    } catch (error: any) {
      console.error('❌ [FRONTEND-COMPONENT] Erreur chargement étages:', error);
      console.error('❌ [FRONTEND-COMPONENT] Message:', error.message);
      console.error('❌ [FRONTEND-COMPONENT] Status:', error.status);
      
      // Utiliser le message d'erreur convivial
      const friendlyMessage = error.friendlyMessage || 
                             error.error?.message || 
                             'Erreur lors du chargement des étages';
      
      this.error = friendlyMessage;
      console.log('🏢 [FRONTEND-COMPONENT] === FIN chargerEtages (ERROR) ===');
    } finally {
      this.loading = false;
    }
  }

  async chargerStatistiques() {
    console.log('📊 [FRONTEND-COMPONENT] === DEBUT chargerStatistiques ===');
    try {
      const response = await this.etageService.obtenirStatistiques().toPromise();
      if (response) {
        console.log('✅ [FRONTEND-COMPONENT] Statistiques étages chargées:', response.stats);
        this.stats = response.stats;
      }
      console.log('📊 [FRONTEND-COMPONENT] === FIN chargerStatistiques (SUCCESS) ===');
    } catch (error: any) {
      console.error('❌ [FRONTEND-COMPONENT] Erreur chargement statistiques étages:', error);
      
      // Ne pas afficher d'erreur pour les statistiques si c'est juste un problème de permissions
      if (error.status !== 403) {
        const friendlyMessage = error.friendlyMessage || 
                               error.error?.message || 
                               'Erreur lors du chargement des statistiques';
        
        // Afficher l'erreur seulement si ce n'est pas déjà affiché
        if (!this.error) {
          this.error = friendlyMessage;
        }
      }
      
      console.log('📊 [FRONTEND-COMPONENT] === FIN chargerStatistiques (ERROR) ===');
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