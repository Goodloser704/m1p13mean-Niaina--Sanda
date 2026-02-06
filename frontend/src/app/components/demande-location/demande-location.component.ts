import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DemandeLocationService } from '../../services/demande-location.service';
import { BoutiqueService } from '../../services/boutique.service';
import { EspaceService } from '../../services/espace.service';
import { EtatDemandeEnum } from '../../utils/enums';

export interface DemandeLocation {
  _id: string;
  boutique: {
    _id: string;
    nom: string;
    commercant?: any;
    proprietaire?: any;
  };
  espace: {
    _id: string;
    codeEspace: string;
    surface: number;
    loyer: number;
    etage: any;
  };
  dateDebutSouhaitee: string;
  dureeContrat: number;
  messageCommercant?: string;
  etatDemande: EtatDemandeEnum;
  dateReponse?: string;
  adminRepondant?: {
    _id: string;
    nom: string;
    prenoms: string;
  };
  contratInfo?: {
    dateDebut: string;
    dateFin: string;
    loyerMensuel: number;
    caution?: number;
    conditionsSpeciales?: string;
  };
  raisonRefus?: string;
  messageAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-demande-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-location.component.html',
  styleUrls: ['./demande-location.component.scss']
})
export class DemandeLocationComponent implements OnInit {
  // État du composant
  chargement = false;
  erreur = '';
  message = '';
  
  // Données
  demandes: DemandeLocation[] = [];
  boutiques: any[] = [];
  espaces: any[] = [];
  
  // Pagination
  pageActuelle = 1;
  demandesParPage = 10;
  totalDemandes = 0;
  totalPages = 0;
  
  // Filtres
  filtreEtat = '';
  filtreSearch = '';
  
  // Modals
  modalDemandeOuverte = false;
  modalDetailsOuverte = false;
  modalReponseOuverte = false;
  
  // Formulaires
  demandeForm = {
    boutiqueId: '',
    espaceId: '',
    dateDebutSouhaitee: '',
    dureeContrat: 12,
    messageCommercant: ''
  };
  
  reponseForm = {
    action: 'accepter' as 'accepter' | 'refuser',
    dateDebut: '',
    dateFin: '',
    loyerMensuel: 0,
    caution: 0,
    conditionsSpeciales: '',
    raisonRefus: '',
    messageAdmin: ''
  };
  
  demandeSelectionnee: DemandeLocation | null = null;
  
  // Enums pour le template
  EtatDemandeEnum = EtatDemandeEnum;
  
  // Permissions
  isAdmin = false;
  isCommercant = false;

  constructor(
    private authService: AuthService,
    private demandeLocationService: DemandeLocationService,
    private boutiqueService: BoutiqueService,
    private espaceService: EspaceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifierAuthentification();
    this.chargerDonnees();
  }

  private verifierAuthentification(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }
    
    // Comparaison insensible à la casse
    this.isAdmin = user.role.toLowerCase() === 'admin';
    this.isCommercant = user.role.toLowerCase() === 'commercant';
    
    if (!this.isAdmin && !this.isCommercant) {
      this.router.navigate(['/']);
      return;
    }
  }

  async chargerDonnees(): Promise<void> {
    try {
      this.chargement = true;
      
      await Promise.all([
        this.chargerDemandes(),
        this.isCommercant ? this.chargerBoutiques() : Promise.resolve(),
        this.chargerEspaces()
      ]);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      this.erreur = 'Erreur lors du chargement des données';
    } finally {
      this.chargement = false;
    }
  }

  private async chargerDemandes(): Promise<void> {
    try {
      const options = {
        page: this.pageActuelle,
        limit: this.demandesParPage,
        etat: this.filtreEtat as EtatDemandeEnum || undefined,
        search: this.filtreSearch || undefined
      };
      
      let response;
      if (this.isAdmin) {
        response = await this.demandeLocationService.obtenirToutesDemandes(options).toPromise();
      } else {
        response = await this.demandeLocationService.obtenirMesDemandes(options).toPromise();
      }
      
      this.demandes = response?.demandes || [];
      this.totalDemandes = response?.pagination?.total || 0;
      this.totalPages = response?.pagination?.totalPages || 0;
      
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      throw error;
    }
  }

  private async chargerBoutiques(): Promise<void> {
    try {
      const response = await this.boutiqueService.getMyBoutiques().toPromise();
      this.boutiques = response?.boutiques || [];
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
    }
  }

  private async chargerEspaces(): Promise<void> {
    try {
      const response = await this.espaceService.obtenirEspaces({ statut: 'Disponible' }).toPromise();
      this.espaces = response?.espaces || [];
    } catch (error) {
      console.error('Erreur chargement espaces:', error);
    }
  }

  // Gestion des demandes
  ouvrirModalDemande(): void {
    if (!this.isCommercant) return;
    
    this.reinitialiserFormulaireDemande();
    this.modalDemandeOuverte = true;
  }

  fermerModalDemande(): void {
    this.modalDemandeOuverte = false;
    this.reinitialiserFormulaireDemande();
  }

  private reinitialiserFormulaireDemande(): void {
    this.demandeForm = {
      boutiqueId: '',
      espaceId: '',
      dateDebutSouhaitee: '',
      dureeContrat: 12,
      messageCommercant: ''
    };
  }

  async creerDemande(): Promise<void> {
    try {
      this.chargement = true;
      
      // Validation
      if (!this.demandeForm.boutiqueId || !this.demandeForm.espaceId || !this.demandeForm.dateDebutSouhaitee) {
        this.erreur = 'Boutique, espace et date de début sont obligatoires';
        return;
      }
      
      await this.demandeLocationService.creerDemande(this.demandeForm).toPromise();
      
      this.message = 'Demande de location créée avec succès';
      this.fermerModalDemande();
      await this.chargerDemandes();
      
    } catch (error) {
      console.error('Erreur création demande:', error);
      this.erreur = 'Erreur lors de la création de la demande';
    } finally {
      this.chargement = false;
    }
  }

  // Gestion des détails
  ouvrirModalDetails(demande: DemandeLocation): void {
    this.demandeSelectionnee = demande;
    this.modalDetailsOuverte = true;
  }

  fermerModalDetails(): void {
    this.modalDetailsOuverte = false;
    this.demandeSelectionnee = null;
  }

  // Gestion des réponses admin
  ouvrirModalReponse(demande: DemandeLocation, action: 'accepter' | 'refuser'): void {
    if (!this.isAdmin) return;
    
    this.demandeSelectionnee = demande;
    this.reponseForm.action = action;
    
    if (action === 'accepter') {
      this.reponseForm.loyerMensuel = demande.espace.loyer;
      this.reponseForm.caution = demande.espace.loyer * 2; // 2 mois de caution par défaut
    }
    
    this.modalReponseOuverte = true;
  }

  fermerModalReponse(): void {
    this.modalReponseOuverte = false;
    this.demandeSelectionnee = null;
    this.reinitialiserFormulaireReponse();
  }

  private reinitialiserFormulaireReponse(): void {
    this.reponseForm = {
      action: 'accepter',
      dateDebut: '',
      dateFin: '',
      loyerMensuel: 0,
      caution: 0,
      conditionsSpeciales: '',
      raisonRefus: '',
      messageAdmin: ''
    };
  }

  async repondreDemande(): Promise<void> {
    if (!this.demandeSelectionnee) return;
    
    try {
      this.chargement = true;
      
      if (this.reponseForm.action === 'accepter') {
        // Validation pour acceptation
        if (!this.reponseForm.dateDebut || !this.reponseForm.dateFin) {
          this.erreur = 'Dates de début et fin sont obligatoires';
          return;
        }
        
        await this.demandeLocationService.accepterDemande(
          this.demandeSelectionnee._id,
          {
            dateDebut: this.reponseForm.dateDebut,
            dateFin: this.reponseForm.dateFin,
            loyerMensuel: this.reponseForm.loyerMensuel,
            caution: this.reponseForm.caution,
            conditionsSpeciales: this.reponseForm.conditionsSpeciales,
            messageAdmin: this.reponseForm.messageAdmin
          }
        ).toPromise();
        
        this.message = 'Demande acceptée avec succès';
      } else {
        // Validation pour refus
        if (!this.reponseForm.raisonRefus) {
          this.erreur = 'La raison du refus est obligatoire';
          return;
        }
        
        await this.demandeLocationService.refuserDemande(
          this.demandeSelectionnee._id,
          {
            raisonRefus: this.reponseForm.raisonRefus,
            messageAdmin: this.reponseForm.messageAdmin
          }
        ).toPromise();
        
        this.message = 'Demande refusée';
      }
      
      this.fermerModalReponse();
      await this.chargerDemandes();
      
    } catch (error) {
      console.error('Erreur réponse demande:', error);
      this.erreur = 'Erreur lors du traitement de la demande';
    } finally {
      this.chargement = false;
    }
  }

  async annulerDemande(demande: DemandeLocation): Promise<void> {
    if (!this.isCommercant || demande.etatDemande !== EtatDemandeEnum.EnAttente) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir annuler cette demande ?`)) {
      return;
    }
    
    try {
      this.chargement = true;
      
      await this.demandeLocationService.annulerDemande(demande._id).toPromise();
      
      this.message = 'Demande annulée avec succès';
      await this.chargerDemandes();
      
    } catch (error) {
      console.error('Erreur annulation demande:', error);
      this.erreur = 'Erreur lors de l\'annulation de la demande';
    } finally {
      this.chargement = false;
    }
  }

  // Utilitaires
  getStatutClass(etat: EtatDemandeEnum): string {
    switch (etat) {
      case EtatDemandeEnum.EnAttente: return 'badge-warning';
      case EtatDemandeEnum.Acceptee: return 'badge-success';
      case EtatDemandeEnum.Refusee: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatutLabel(etat: EtatDemandeEnum): string {
    switch (etat) {
      case EtatDemandeEnum.EnAttente: return 'En attente';
      case EtatDemandeEnum.Acceptee: return 'Acceptée';
      case EtatDemandeEnum.Refusee: return 'Refusée';
      default: return 'Inconnu';
    }
  }

  calculerDateFin(): void {
    if (this.reponseForm.dateDebut && this.reponseForm.action === 'accepter' && this.demandeSelectionnee) {
      const dateDebut = new Date(this.reponseForm.dateDebut);
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + this.demandeSelectionnee.dureeContrat);
      
      this.reponseForm.dateFin = dateFin.toISOString().split('T')[0];
    }
  }

  filtrerDemandes(): void {
    this.pageActuelle = 1;
    this.chargerDemandes();
  }

  changerPage(page: number): void {
    this.pageActuelle = page;
    this.chargerDemandes();
  }

  effacerMessages(): void {
    this.erreur = '';
    this.message = '';
  }
}