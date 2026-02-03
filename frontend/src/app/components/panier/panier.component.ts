import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PortefeuilleService } from '../../services/portefeuille.service';
import { AchatService, AchatRequest, PanierRequest } from '../../services/achat.service';
import { TypeAchatEnum } from '../../utils/enums';

export interface ProduitPanier {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  dureePreparation: number;
  typeAchat: TypeAchatEnum[];
  boutique: {
    _id: string;
    nom: string;
    proprietaire: string;
  };
  quantite: number;
  typeAchatChoisi: TypeAchatEnum;
  sousTotal: number;
}

export interface PanierBoutique {
  boutiqueId: string;
  nomBoutique: string;
  produits: ProduitPanier[];
  sousTotal: number;
  dureePreparationMax: number;
}

export interface Panier {
  boutiques: PanierBoutique[];
  totalProduits: number;
  totalMontant: number;
  dureePreparationMax: number;
}

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit {
  // État du composant
  chargement = false;
  erreur = '';
  message = '';
  
  // Données
  panier: Panier = {
    boutiques: [],
    totalProduits: 0,
    totalMontant: 0,
    dureePreparationMax: 0
  };
  
  portefeuille: any = null;
  
  // Modal de confirmation
  modalConfirmationOuverte = false;
  commandeEnCours = false;
  
  // Enums pour le template
  TypeAchatEnum = TypeAchatEnum;

  constructor(
    private authService: AuthService,
    private portefeuilleService: PortefeuilleService,
    private achatService: AchatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifierAuthentification();
    this.chargerPanier();
    this.chargerPortefeuille();
  }

  private verifierAuthentification(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'client') {
      this.router.navigate(['/']);
      return;
    }
  }

  private chargerPanier(): void {
    // Récupérer le panier depuis le localStorage
    const panierData = localStorage.getItem('panier');
    if (panierData) {
      try {
        const produits = JSON.parse(panierData);
        this.construirePanier(produits);
      } catch (error) {
        console.error('Erreur parsing panier:', error);
        this.viderPanier();
      }
    }
  }

  private construirePanier(produits: ProduitPanier[]): void {
    // Grouper les produits par boutique
    const boutiquesMap = new Map<string, PanierBoutique>();
    
    produits.forEach(produit => {
      const boutiqueId = produit.boutique._id;
      
      if (!boutiquesMap.has(boutiqueId)) {
        boutiquesMap.set(boutiqueId, {
          boutiqueId,
          nomBoutique: produit.boutique.nom,
          produits: [],
          sousTotal: 0,
          dureePreparationMax: 0
        });
      }
      
      const boutique = boutiquesMap.get(boutiqueId)!;
      boutique.produits.push(produit);
      boutique.sousTotal += produit.sousTotal;
      boutique.dureePreparationMax = Math.max(boutique.dureePreparationMax, produit.dureePreparation);
    });
    
    // Construire le panier final
    this.panier = {
      boutiques: Array.from(boutiquesMap.values()),
      totalProduits: produits.reduce((total, p) => total + p.quantite, 0),
      totalMontant: produits.reduce((total, p) => total + p.sousTotal, 0),
      dureePreparationMax: Math.max(...Array.from(boutiquesMap.values()).map(b => b.dureePreparationMax))
    };
  }

  private async chargerPortefeuille(): Promise<void> {
    try {
      const response = await this.portefeuilleService.obtenirMonPortefeuille().toPromise();
      this.portefeuille = response?.portefeuille;
    } catch (error) {
      console.error('Erreur chargement portefeuille:', error);
    }
  }

  // Gestion des quantités
  modifierQuantite(boutique: PanierBoutique, produit: ProduitPanier, nouvelleQuantite: number): void {
    if (nouvelleQuantite <= 0) {
      this.retirerProduit(boutique, produit);
      return;
    }
    
    produit.quantite = nouvelleQuantite;
    produit.sousTotal = produit.prix * nouvelleQuantite;
    
    this.mettreAJourPanier();
  }

  augmenterQuantite(boutique: PanierBoutique, produit: ProduitPanier): void {
    this.modifierQuantite(boutique, produit, produit.quantite + 1);
  }

  diminuerQuantite(boutique: PanierBoutique, produit: ProduitPanier): void {
    this.modifierQuantite(boutique, produit, produit.quantite - 1);
  }

  retirerProduit(boutique: PanierBoutique, produit: ProduitPanier): void {
    const index = boutique.produits.indexOf(produit);
    if (index > -1) {
      boutique.produits.splice(index, 1);
      
      // Si la boutique n'a plus de produits, la retirer
      if (boutique.produits.length === 0) {
        const boutiqueIndex = this.panier.boutiques.indexOf(boutique);
        if (boutiqueIndex > -1) {
          this.panier.boutiques.splice(boutiqueIndex, 1);
        }
      }
      
      this.mettreAJourPanier();
    }
  }

  changerTypeAchat(produit: ProduitPanier, nouveauType: TypeAchatEnum): void {
    produit.typeAchatChoisi = nouveauType;
    this.sauvegarderPanier();
  }

  private mettreAJourPanier(): void {
    // Recalculer les sous-totaux des boutiques
    this.panier.boutiques.forEach(boutique => {
      boutique.sousTotal = boutique.produits.reduce((total, p) => total + p.sousTotal, 0);
      boutique.dureePreparationMax = Math.max(...boutique.produits.map(p => p.dureePreparation));
    });
    
    // Recalculer les totaux généraux
    this.panier.totalProduits = this.panier.boutiques.reduce((total, b) => 
      total + b.produits.reduce((sousTotal, p) => sousTotal + p.quantite, 0), 0);
    this.panier.totalMontant = this.panier.boutiques.reduce((total, b) => total + b.sousTotal, 0);
    this.panier.dureePreparationMax = this.panier.boutiques.length > 0 ? 
      Math.max(...this.panier.boutiques.map(b => b.dureePreparationMax)) : 0;
    
    this.sauvegarderPanier();
  }

  private sauvegarderPanier(): void {
    // Aplatir les produits pour le localStorage
    const produits: ProduitPanier[] = [];
    this.panier.boutiques.forEach(boutique => {
      produits.push(...boutique.produits);
    });
    
    localStorage.setItem('panier', JSON.stringify(produits));
  }

  viderPanier(): void {
    this.panier = {
      boutiques: [],
      totalProduits: 0,
      totalMontant: 0,
      dureePreparationMax: 0
    };
    localStorage.removeItem('panier');
  }

  // Validation de commande
  ouvrirModalConfirmation(): void {
    if (this.panier.boutiques.length === 0) {
      this.erreur = 'Votre panier est vide';
      return;
    }
    
    if (!this.portefeuille || this.portefeuille.balance < this.panier.totalMontant) {
      this.erreur = 'Solde insuffisant. Veuillez recharger votre portefeuille.';
      return;
    }
    
    this.modalConfirmationOuverte = true;
  }

  fermerModalConfirmation(): void {
    this.modalConfirmationOuverte = false;
  }

  async validerCommande(): Promise<void> {
    try {
      this.commandeEnCours = true;
      this.erreur = '';
      
      // Préparer les données du panier pour l'API
      const achats: AchatRequest[] = [];
      
      this.panier.boutiques.forEach(boutique => {
        boutique.produits.forEach(produit => {
          achats.push({
            produit: produit._id,
            quantite: produit.quantite,
            typeAchat: produit.typeAchatChoisi,
            prixUnitaire: produit.prix
          });
        });
      });
      
      const panierRequest: PanierRequest = {
        achats,
        montantTotal: this.panier.totalMontant
      };
      
      console.log('🛒 Envoi du panier à l\'API:', panierRequest);
      
      // Appel API réel pour valider le panier
      const response = await this.achatService.validerPanier(panierRequest).toPromise();
      
      console.log('✅ Réponse API:', response);
      
      this.message = `Commande validée avec succès ! Facture n°${response?.facture._id}`;
      this.viderPanier();
      this.fermerModalConfirmation();
      
      // Rediriger vers les commandes après un délai
      setTimeout(() => {
        this.router.navigate(['/mes-commandes']);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Erreur validation commande:', error);
      
      // Gestion des erreurs spécifiques
      if (error.status === 400) {
        if (error.error?.message?.includes('Solde insuffisant')) {
          this.erreur = `Solde insuffisant. Solde actuel: ${error.error.soldeActuel}€, Montant requis: ${error.error.montantRequis}€`;
        } else if (error.error?.message?.includes('Stock insuffisant')) {
          this.erreur = 'Stock insuffisant pour certains produits. Veuillez actualiser votre panier.';
        } else if (error.error?.message?.includes('Prix modifié')) {
          this.erreur = 'Les prix ont été modifiés. Veuillez actualiser votre panier.';
        } else {
          this.erreur = error.error?.message || 'Données invalides';
        }
      } else if (error.status === 401) {
        this.erreur = 'Session expirée. Veuillez vous reconnecter.';
        this.authService.logout();
        this.router.navigate(['/']);
      } else if (error.status === 404) {
        this.erreur = 'Certains produits ne sont plus disponibles.';
      } else {
        this.erreur = 'Erreur lors de la validation de la commande. Veuillez réessayer.';
      }
    } finally {
      this.commandeEnCours = false;
    }
  }

  // Utilitaires
  getPourcentageSolde(): number {
    if (!this.portefeuille || this.portefeuille.balance === 0) return 0;
    return Math.min((this.panier.totalMontant / this.portefeuille.balance) * 100, 100);
  }

  getClasseSolde(): string {
    const pourcentage = this.getPourcentageSolde();
    if (pourcentage > 100) return 'text-danger';
    if (pourcentage > 80) return 'text-warning';
    return 'text-success';
  }

  getTempsPreparationTotal(): string {
    if (this.panier.dureePreparationMax === 0) return '0 min';
    
    const heures = Math.floor(this.panier.dureePreparationMax / 60);
    const minutes = this.panier.dureePreparationMax % 60;
    
    if (heures > 0) {
      return `${heures}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${minutes} min`;
  }

  getIconeTypeAchat(type: TypeAchatEnum): string {
    switch (type) {
      case TypeAchatEnum.Recuperer: return 'fas fa-walking';
      case TypeAchatEnum.Livrer: return 'fas fa-truck';
      default: return 'fas fa-shopping-bag';
    }
  }

  continuerAchats(): void {
    this.router.navigate(['/boutiques']);
  }

  allerPortefeuille(): void {
    this.router.navigate(['/portefeuille']);
  }

  effacerMessages(): void {
    this.erreur = '';
    this.message = '';
  }
}