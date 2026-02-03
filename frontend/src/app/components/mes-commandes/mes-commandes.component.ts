import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AchatService, Achat } from '../../services/achat.service';
import { EtatAchatEnum, TypeAchatEnum } from '../../utils/enums';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.scss']
})
export class MesCommandesComponent implements OnInit {
  // État du composant
  chargement = false;
  erreur = '';
  message = '';
  
  // Données
  achatsEnCours: Achat[] = [];
  historiqueAchats: Achat[] = [];
  
  // Filtres et pagination
  filtreActif = 'en-cours';
  filtreEtat: EtatAchatEnum | '' = '';
  page = 1;
  limit = 10;
  totalPages = 1;
  
  // Enums pour le template
  EtatAchatEnum = EtatAchatEnum;
  TypeAchatEnum = TypeAchatEnum;
  
  // Modal d'annulation
  modalAnnulationOuverte = false;
  achatAnnuler: Achat | null = null;
  raisonAnnulation = '';

  constructor(
    private authService: AuthService,
    private achatService: AchatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifierAuthentification();
    this.chargerAchatsEnCours();
  }

  private verifierAuthentification(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'client') {
      this.router.navigate(['/']);
      return;
    }
  }

  // Chargement des données
  async chargerAchatsEnCours(): Promise<void> {
    try {
      this.chargement = true;
      this.erreur = '';
      
      const response = await this.achatService.obtenirMesAchatsEnCours().toPromise();
      this.achatsEnCours = response?.achats || [];
      
      console.log('📋 Achats en cours chargés:', this.achatsEnCours.length);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement achats en cours:', error);
      this.erreur = 'Erreur lors du chargement des commandes en cours';
    } finally {
      this.chargement = false;
    }
  }

  async chargerHistorique(): Promise<void> {
    try {
      this.chargement = true;
      this.erreur = '';
      
      const options = {
        page: this.page,
        limit: this.limit,
        ...(this.filtreEtat && { etat: this.filtreEtat })
      };
      
      const response = await this.achatService.obtenirMonHistoriqueAchats(options).toPromise();
      this.historiqueAchats = response?.achats || [];
      this.totalPages = response?.pagination?.pages || 1;
      
      console.log('📚 Historique chargé:', this.historiqueAchats.length);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement historique:', error);
      this.erreur = 'Erreur lors du chargement de l\'historique';
    } finally {
      this.chargement = false;
    }
  }

  // Navigation entre les onglets
  changerFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.page = 1;
    
    if (filtre === 'en-cours') {
      this.chargerAchatsEnCours();
    } else {
      this.chargerHistorique();
    }
  }

  // Filtrage par état
  changerFiltreEtat(etat: EtatAchatEnum | ''): void {
    this.filtreEtat = etat;
    this.page = 1;
    this.chargerHistorique();
  }

  // Pagination
  changerPage(nouvellePage: number): void {
    if (nouvellePage >= 1 && nouvellePage <= this.totalPages) {
      this.page = nouvellePage;
      this.chargerHistorique();
    }
  }

  // Actions sur les achats
  ouvrirModalAnnulation(achat: Achat): void {
    this.achatAnnuler = achat;
    this.raisonAnnulation = '';
    this.modalAnnulationOuverte = true;
  }

  fermerModalAnnulation(): void {
    this.modalAnnulationOuverte = false;
    this.achatAnnuler = null;
    this.raisonAnnulation = '';
  }

  async confirmerAnnulation(): Promise<void> {
    if (!this.achatAnnuler) return;
    
    try {
      this.chargement = true;
      
      await this.achatService.annulerAchat(this.achatAnnuler._id, this.raisonAnnulation).toPromise();
      
      this.message = 'Commande annulée avec succès';
      this.fermerModalAnnulation();
      
      // Recharger les données
      if (this.filtreActif === 'en-cours') {
        this.chargerAchatsEnCours();
      } else {
        this.chargerHistorique();
      }
      
    } catch (error: any) {
      console.error('❌ Erreur annulation:', error);
      this.erreur = error.error?.message || 'Erreur lors de l\'annulation';
    } finally {
      this.chargement = false;
    }
  }

  // Vérifications
  peutAnnuler(achat: Achat): boolean {
    if (achat.etat === EtatAchatEnum.Annulee) return false;
    
    const maintenant = new Date();
    const dateFin = new Date(achat.typeAchat.dateFin);
    
    // Pour les achats "Récupérer", on peut annuler jusqu'à la date de fin
    // Pour les achats "Livrer", on peut annuler tant qu'ils sont en attente
    return (
      (achat.typeAchat.type === TypeAchatEnum.Recuperer && maintenant < dateFin) ||
      (achat.typeAchat.type === TypeAchatEnum.Livrer && achat.etat === EtatAchatEnum.EnAttente)
    );
  }

  // Utilitaires d'affichage
  getEtatIcon(etat: EtatAchatEnum): string {
    return this.achatService.getEtatIcon(etat);
  }

  getEtatColor(etat: EtatAchatEnum): string {
    return this.achatService.getEtatColor(etat);
  }

  getTypeAchatIcon(type: TypeAchatEnum): string {
    return this.achatService.getTypeAchatIcon(type);
  }

  getTempsRestant(dateFin: string): string {
    return this.achatService.getTempsRestant(dateFin);
  }

  formatMontant(montant: number): string {
    return this.achatService.formatMontant(montant);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEtatLabel(etat: EtatAchatEnum): string {
    switch (etat) {
      case EtatAchatEnum.EnAttente: return 'En attente';
      case EtatAchatEnum.Validee: return 'Validée';
      case EtatAchatEnum.Annulee: return 'Annulée';
      default: return etat;
    }
  }

  getTypeAchatLabel(type: TypeAchatEnum): string {
    switch (type) {
      case TypeAchatEnum.Recuperer: return 'À récupérer';
      case TypeAchatEnum.Livrer: return 'Livraison';
      default: return type;
    }
  }

  // Navigation
  voirDetailsBoutique(boutiqueId: string): void {
    this.router.navigate(['/boutique', boutiqueId]);
  }

  allerPanier(): void {
    this.router.navigate(['/panier']);
  }

  allerBoutiques(): void {
    this.router.navigate(['/boutiques']);
  }

  effacerMessages(): void {
    this.erreur = '';
    this.message = '';
  }
}