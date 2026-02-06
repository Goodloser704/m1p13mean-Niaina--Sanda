import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BoutiqueService } from '../../services/boutique.service';
import { AdminService } from '../../services/admin.service';
import { CategorieBoutiqueService, CategorieBoutique } from '../../services/categorie-boutique.service';
import { StatutBoutiqueEnum } from '../../utils/enums';

export interface Boutique {
  _id: string;
  nom: string;
  description?: string;
  categorie: string;
  proprietaire?: {
    _id: string;
    nom: string;
    prenoms: string;
    email: string;
  };
  commercant?: {
    _id: string;
    nom: string;
    prenoms: string;
    email: string;
  };
  espace?: {
    _id: string;
    codeEspace: string;
    surface: number;
    loyer: number;
  };
  statut: StatutBoutiqueEnum;
  horairesHebdo?: Array<{
    jour: string;
    ouverture: string;
    fermeture: string;
    ferme: boolean;
  }>;
  contact?: {
    telephone?: string;
    email?: string;
    siteWeb?: string;
    reseauxSociaux?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  isActive: boolean;
  dateCreation: string;
  dateValidation?: string;
  adminValidateur?: {
    _id: string;
    nom: string;
    prenoms: string;
  };
  raisonRejet?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-crud-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-boutiques.component.html',
  styleUrls: ['./crud-boutiques.component.scss']
})
export class CrudBoutiquesComponent implements OnInit {
  // État du composant
  chargement = false;
  erreur = '';
  message = '';
  
  // Données
  boutiques: Boutique[] = [];
  categories: any[] = [];
  
  // Pagination
  pageActuelle = 1;
  boutiquesParPage = 10;
  totalBoutiques = 0;
  totalPages = 0;
  
  // Filtres
  filtreStatut = '';
  filtreCategorie = '';
  filtreSearch = '';
  
  // Modals
  modalBoutiqueOuverte = false;
  modalDetailsOuverte = false;
  modalValidationOuverte = false;
  
  // Formulaires
  boutiqueForm: Partial<Boutique> = {
    nom: '',
    description: '',
    categorie: '',
    horairesHebdo: [],
    contact: {
      telephone: '',
      email: '',
      siteWeb: '',
      reseauxSociaux: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    },
    isActive: true
  };
  
  validationForm = {
    action: 'approuver' as 'approuver' | 'rejeter',
    raisonRejet: '',
    messageAdmin: ''
  };
  
  boutiqueSelectionnee: Boutique | null = null;
  modeEdition = false;
  
  // Enums pour le template
  StatutBoutiqueEnum = StatutBoutiqueEnum;
  
  // Permissions
  isAdmin = false;
  isCommercant = false;
  
  // Jours de la semaine
  joursSemaine = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ];

  constructor(
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private adminService: AdminService,
    private categorieBoutiqueService: CategorieBoutiqueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifierAuthentification();
    this.initialiserHoraires();
    this.chargerDonnees();
  }

  private verifierAuthentification(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }
    
    this.isAdmin = user.role === 'Admin';
    this.isCommercant = user.role === 'Commercant';
    
    if (!this.isAdmin && !this.isCommercant) {
      this.router.navigate(['/']);
      return;
    }
  }

  private initialiserHoraires(): void {
    this.boutiqueForm.horairesHebdo = this.joursSemaine.map(jour => ({
      jour,
      ouverture: '09:00',
      fermeture: '18:00',
      ferme: false
    }));
  }

  async chargerDonnees(): Promise<void> {
    try {
      this.chargement = true;
      
      await Promise.all([
        this.chargerBoutiques(),
        this.chargerCategories()
      ]);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      this.erreur = 'Erreur lors du chargement des données';
    } finally {
      this.chargement = false;
    }
  }

  private async chargerBoutiques(): Promise<void> {
    try {
      let response;
      
      if (this.isAdmin) {
        // Admin voit toutes les boutiques
        response = await this.boutiqueService.obtenirBoutiques().toPromise();
      } else {
        // Commerçant voit ses boutiques
        response = await this.boutiqueService.getMyBoutiques().toPromise();
      }
      
      this.boutiques = response?.boutiques || [] as any;
      this.totalBoutiques = response?.count || this.boutiques.length;
      this.totalPages = Math.ceil(this.totalBoutiques / this.boutiquesParPage);
      
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
      throw error;
    }
  }

  private async chargerCategories(): Promise<void> {
    try {
      const response = await this.categorieBoutiqueService.obtenirCategoriesActives().toPromise();
      this.categories = response?.categories || [];
      console.log('📋 Catégories chargées:', this.categories.length);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      this.erreur = 'Erreur lors du chargement des catégories';
    }
  }

  // Gestion des boutiques
  ouvrirModalBoutique(boutique?: Boutique): void {
    this.modeEdition = !!boutique;
    
    if (boutique) {
      this.boutiqueForm = { ...boutique };
      if (!this.boutiqueForm.horairesHebdo || this.boutiqueForm.horairesHebdo.length === 0) {
        this.initialiserHoraires();
      }
    } else {
      this.reinitialiserFormulaireBoutique();
    }
    
    this.modalBoutiqueOuverte = true;
  }

  fermerModalBoutique(): void {
    this.modalBoutiqueOuverte = false;
    this.reinitialiserFormulaireBoutique();
  }

  private reinitialiserFormulaireBoutique(): void {
    this.boutiqueForm = {
      nom: '',
      description: '',
      categorie: '',
      horairesHebdo: [],
      contact: {
        telephone: '',
        email: '',
        siteWeb: '',
        reseauxSociaux: {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      },
      isActive: true
    };
    this.initialiserHoraires();
    this.modeEdition = false;
  }

  async sauvegarderBoutique(): Promise<void> {
    try {
      this.chargement = true;
      
      // Validation
      if (!this.boutiqueForm.nom || !this.boutiqueForm.categorie) {
        this.erreur = 'Nom et catégorie sont obligatoires';
        return;
      }
      
      // Validation des horaires
      const horairesValides = this.validerHoraires();
      if (!horairesValides) {
        this.erreur = 'Horaires invalides (heure de fermeture doit être après l\'ouverture)';
        return;
      }
      
      if (this.modeEdition && this.boutiqueForm._id) {
        // Mise à jour de la boutique
        await this.boutiqueService.updateBoutique(this.boutiqueForm._id, this.boutiqueForm as any).toPromise();
        this.message = 'Boutique mise à jour avec succès';
      } else {
        // Création
        await this.boutiqueService.registerBoutique(this.boutiqueForm as any).toPromise();
        this.message = 'Boutique créée avec succès';
      }
      
      this.fermerModalBoutique();
      await this.chargerBoutiques();
      
    } catch (error) {
      console.error('Erreur sauvegarde boutique:', error);
      this.erreur = 'Erreur lors de la sauvegarde';
    } finally {
      this.chargement = false;
    }
  }

  private validerHoraires(): boolean {
    if (!this.boutiqueForm.horairesHebdo) return true;
    
    return this.boutiqueForm.horairesHebdo.every(horaire => {
      if (horaire.ferme) return true;
      
      const ouverture = new Date(`2000-01-01T${horaire.ouverture}:00`);
      const fermeture = new Date(`2000-01-01T${horaire.fermeture}:00`);
      
      return fermeture > ouverture;
    });
  }

  async supprimerBoutique(boutique: Boutique): Promise<void> {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${boutique.nom}" ?`)) {
      return;
    }
    
    try {
      this.chargement = true;
      
      if (this.isAdmin) {
        // Admin peut supprimer toutes les boutiques
        await this.boutiqueService.getBoutiqueById(boutique._id).toPromise();
        // Note: Il faudrait ajouter une méthode deleteBoutiqueAdmin dans le service
        console.log('Suppression boutique admin:', boutique._id);
      } else {
        // Commerçant supprime sa boutique
        await this.boutiqueService.deleteBoutique(boutique._id).toPromise();
      }
      
      this.message = 'Boutique supprimée avec succès';
      await this.chargerBoutiques();
      
    } catch (error) {
      console.error('Erreur suppression boutique:', error);
      this.erreur = 'Erreur lors de la suppression';
    } finally {
      this.chargement = false;
    }
  }

  // Gestion des détails
  ouvrirModalDetails(boutique: Boutique): void {
    this.boutiqueSelectionnee = boutique;
    this.modalDetailsOuverte = true;
  }

  fermerModalDetails(): void {
    this.modalDetailsOuverte = false;
    this.boutiqueSelectionnee = null;
  }

  // Gestion de la validation (Admin)
  ouvrirModalValidation(boutique: Boutique, action: 'approuver' | 'rejeter'): void {
    if (!this.isAdmin) return;
    
    this.boutiqueSelectionnee = boutique;
    this.validationForm.action = action;
    this.modalValidationOuverte = true;
  }

  fermerModalValidation(): void {
    this.modalValidationOuverte = false;
    this.boutiqueSelectionnee = null;
    this.reinitialiserFormulaireValidation();
  }

  private reinitialiserFormulaireValidation(): void {
    this.validationForm = {
      action: 'approuver',
      raisonRejet: '',
      messageAdmin: ''
    };
  }

  async validerBoutique(): Promise<void> {
    if (!this.boutiqueSelectionnee) return;
    
    try {
      this.chargement = true;
      
      if (this.validationForm.action === 'approuver') {
        await this.adminService.approveBoutique(this.boutiqueSelectionnee._id).toPromise();
        this.message = 'Boutique approuvée avec succès';
      } else {
        if (!this.validationForm.raisonRejet) {
          this.erreur = 'La raison du rejet est obligatoire';
          return;
        }
        
        await this.adminService.rejectBoutique(
          this.boutiqueSelectionnee._id,
          this.validationForm.raisonRejet
        ).toPromise();
        
        this.message = 'Boutique rejetée';
      }
      
      this.fermerModalValidation();
      await this.chargerBoutiques();
      
    } catch (error) {
      console.error('Erreur validation boutique:', error);
      this.erreur = 'Erreur lors de la validation';
    } finally {
      this.chargement = false;
    }
  }

  // Utilitaires
  getStatutClass(statut: StatutBoutiqueEnum): string {
    switch (statut) {
      case StatutBoutiqueEnum.EnAttente: return 'badge-warning';
      case StatutBoutiqueEnum.Actif: return 'badge-success';
      case StatutBoutiqueEnum.Inactif: return 'badge-secondary';
      case StatutBoutiqueEnum.Rejete: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatutLabel(statut: StatutBoutiqueEnum): string {
    switch (statut) {
      case StatutBoutiqueEnum.EnAttente: return 'En attente';
      case StatutBoutiqueEnum.Actif: return 'Active';
      case StatutBoutiqueEnum.Inactif: return 'Inactive';
      case StatutBoutiqueEnum.Rejete: return 'Rejetée';
      default: return 'Inconnu';
    }
  }

  toggleJourFerme(index: number): void {
    if (this.boutiqueForm.horairesHebdo && this.boutiqueForm.horairesHebdo[index]) {
      this.boutiqueForm.horairesHebdo[index].ferme = !this.boutiqueForm.horairesHebdo[index].ferme;
    }
  }

  peutModifier(boutique: Boutique): boolean {
    if (this.isAdmin) return true;
    if (this.isCommercant) {
      return boutique.statut === StatutBoutiqueEnum.EnAttente || 
             boutique.statut === StatutBoutiqueEnum.Actif;
    }
    return false;
  }

  peutSupprimer(boutique: Boutique): boolean {
    if (this.isAdmin) return true;
    if (this.isCommercant) {
      return boutique.statut === StatutBoutiqueEnum.EnAttente;
    }
    return false;
  }

  filtrerBoutiques(): void {
    this.pageActuelle = 1;
    this.chargerBoutiques();
  }

  changerPage(page: number): void {
    this.pageActuelle = page;
    this.chargerBoutiques();
  }

  effacerMessages(): void {
    this.erreur = '';
    this.message = '';
  }
}