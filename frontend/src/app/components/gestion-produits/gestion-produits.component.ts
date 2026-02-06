import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BoutiqueService } from '../../services/boutique.service';
import { ProduitService } from '../../services/produit.service';
import { StatutBoutiqueEnum, TypeAchatEnum } from '../../utils/enums';

export interface Produit {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  stock: {
    nombreDispo: number;
    nombreReserve: number;
    seuilAlerte: number;
  };
  typeProduit: {
    _id: string;
    nom: string;
  };
  boutique: {
    _id: string;
    nom: string;
    proprietaire: string;
  };
  dureePreparation: number;
  typeAchat: TypeAchatEnum[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypeProduit {
  _id: string;
  nom: string;
  description: string;
  boutique: string;
  isActive: boolean;
}

@Component({
  selector: 'app-gestion-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-produits.component.html',
  styleUrls: ['./gestion-produits.component.scss']
})
export class GestionProduitsComponent implements OnInit {
  // État du composant
  chargement = false;
  erreur = '';
  message = '';
  
  // Données
  produits: Produit[] = [];
  typesProduit: TypeProduit[] = [];
  boutiques: any[] = [];
  boutiqueSelectionnee: any = null;
  
  // Pagination
  pageActuelle = 1;
  produitsParPage = 10;
  totalProduits = 0;
  totalPages = 0;
  
  // Filtres
  filtreNom = '';
  filtreType = '';
  filtreStock = '';
  
  // Modals
  modalProduitOuverte = false;
  modalTypeOuverte = false;
  modalStockOuverte = false;
  
  // Formulaires
  produitForm: Partial<Produit> = {
    nom: '',
    description: '',
    prix: 0,
    stock: {
      nombreDispo: 0,
      nombreReserve: 0,
      seuilAlerte: 5
    },
    dureePreparation: 15,
    typeAchat: [TypeAchatEnum.Recuperer],
    isActive: true
  };
  
  typeForm: Partial<TypeProduit> = {
    nom: '',
    description: '',
    isActive: true
  };
  
  stockForm = {
    produitId: '',
    nouveauStock: 0,
    operation: 'ajouter' as 'ajouter' | 'retirer' | 'definir'
  };
  
  modeEdition = false;
  produitEnEdition: string | null = null;
  typeEnEdition: string | null = null;

  // Enums pour le template
  TypeAchatEnum = TypeAchatEnum;

  constructor(
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private produitService: ProduitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifierAuthentification();
    this.chargerBoutiques();
  }

  private verifierAuthentification(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Commercant') {
      this.router.navigate(['/']);
      return;
    }
  }

  private async chargerBoutiques(): Promise<void> {
    try {
      this.chargement = true;
      const response = await this.boutiqueService.getMyBoutiques().toPromise();
      this.boutiques = response?.boutiques || [];
      
      if (this.boutiques.length > 0) {
        this.boutiqueSelectionnee = this.boutiques[0];
        await this.chargerDonneesBoutique();
      }
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
      this.erreur = 'Erreur lors du chargement des boutiques';
    } finally {
      this.chargement = false;
    }
  }

  async changerBoutique(boutique: any): Promise<void> {
    this.boutiqueSelectionnee = boutique;
    await this.chargerDonneesBoutique();
  }

  async chargerDonneesBoutique(): Promise<void> {
    if (!this.boutiqueSelectionnee) return;
    
    try {
      this.chargement = true;
      await Promise.all([
        this.chargerProduits(),
        this.chargerTypesProduit()
      ]);
    } catch (error) {
      console.error('Erreur chargement données boutique:', error);
      this.erreur = 'Erreur lors du chargement des données';
    } finally {
      this.chargement = false;
    }
  }

  private async chargerProduits(): Promise<void> {
    if (!this.boutiqueSelectionnee) return;
    
    try {
      const options = {
        page: this.pageActuelle,
        limit: this.produitsParPage,
        recherche: this.filtreNom || undefined,
        typeProduit: this.filtreType || undefined,
        enStock: this.filtreStock === 'en_stock' ? true : undefined
      };
      
      const response = await this.produitService.obtenirProduitsParBoutique(
        this.boutiqueSelectionnee._id, 
        options
      ).toPromise();
      
      this.produits = response?.produits || [];
      this.totalProduits = response?.pagination?.total || 0;
      this.totalPages = response?.pagination?.totalPages || 0;
      
      console.log('📦 Produits chargés:', this.produits.length);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      this.erreur = 'Erreur lors du chargement des produits';
    }
  }

  private async chargerTypesProduit(): Promise<void> {
    if (!this.boutiqueSelectionnee) return;
    
    try {
      const response = await this.produitService.obtenirTypesParBoutique(
        this.boutiqueSelectionnee._id
      ).toPromise();
      
      this.typesProduit = response?.typesProduit || [];
      console.log('🏷️ Types produits chargés:', this.typesProduit.length);
    } catch (error) {
      console.error('Erreur chargement types produits:', error);
      this.erreur = 'Erreur lors du chargement des types de produits';
    }
  }

  // Gestion des produits
  ouvrirModalProduit(produit?: Produit): void {
    this.modeEdition = !!produit;
    this.produitEnEdition = produit?._id || null;
    
    if (produit) {
      this.produitForm = { ...produit };
    } else {
      this.reinitialiserFormulaireProduit();
    }
    
    this.modalProduitOuverte = true;
  }

  fermerModalProduit(): void {
    this.modalProduitOuverte = false;
    this.reinitialiserFormulaireProduit();
  }

  private reinitialiserFormulaireProduit(): void {
    this.produitForm = {
      nom: '',
      description: '',
      prix: 0,
      stock: {
        nombreDispo: 0,
        nombreReserve: 0,
        seuilAlerte: 5
      },
      dureePreparation: 15,
      typeAchat: [TypeAchatEnum.Recuperer],
      isActive: true
    };
    this.modeEdition = false;
    this.produitEnEdition = null;
  }

  async sauvegarderProduit(): Promise<void> {
    try {
      this.chargement = true;
      
      // Validation
      if (!this.produitForm.nom || !this.produitForm.prix) {
        this.erreur = 'Nom et prix sont obligatoires';
        return;
      }
      
      // Préparer les données
      const produitData: any = {
        nom: this.produitForm.nom!,
        description: this.produitForm.description,
        prix: this.produitForm.prix!,
        stock: this.produitForm.stock!,
        typeProduit: this.produitForm.typeProduit?._id,
        dureePreparation: this.produitForm.dureePreparation!,
        typeAchat: this.produitForm.typeAchat!,
        isActive: this.produitForm.isActive
      };
      
      if (this.modeEdition && this.produitEnEdition) {
        await this.produitService.mettreAJourProduit(this.produitEnEdition, produitData).toPromise();
        this.message = 'Produit mis à jour avec succès';
      } else {
        await this.produitService.creerProduit(produitData).toPromise();
        this.message = 'Produit créé avec succès';
      }
      
      this.fermerModalProduit();
      await this.chargerProduits();
      
    } catch (error: any) {
      console.error('Erreur sauvegarde produit:', error);
      this.erreur = error.error?.message || 'Erreur lors de la sauvegarde';
    } finally {
      this.chargement = false;
    }
  }

  async supprimerProduit(produit: Produit): Promise<void> {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${produit.nom}" ?`)) {
      return;
    }
    
    try {
      this.chargement = true;
      await this.produitService.supprimerProduit(produit._id).toPromise();
      
      this.message = 'Produit supprimé avec succès';
      await this.chargerProduits();
      
    } catch (error: any) {
      console.error('Erreur suppression produit:', error);
      this.erreur = error.error?.message || 'Erreur lors de la suppression';
    } finally {
      this.chargement = false;
    }
  }

  // Gestion des types de produit
  ouvrirModalType(type?: TypeProduit): void {
    this.modeEdition = !!type;
    this.typeEnEdition = type?._id || null;
    
    if (type) {
      this.typeForm = { ...type };
    } else {
      this.reinitialiserFormulaireType();
    }
    
    this.modalTypeOuverte = true;
  }

  fermerModalType(): void {
    this.modalTypeOuverte = false;
    this.reinitialiserFormulaireType();
  }

  private reinitialiserFormulaireType(): void {
    this.typeForm = {
      nom: '',
      description: '',
      isActive: true
    };
    this.modeEdition = false;
    this.typeEnEdition = null;
  }

  async sauvegarderType(): Promise<void> {
    try {
      this.chargement = true;
      
      // Validation
      if (!this.typeForm.nom) {
        this.erreur = 'Le nom est obligatoire';
        return;
      }
      
      // Préparer les données
      const typeData: any = {
        nom: this.typeForm.nom!,
        description: this.typeForm.description,
        isActive: this.typeForm.isActive
      };
      
      if (this.modeEdition && this.typeEnEdition) {
        await this.produitService.mettreAJourTypeProduit(this.typeEnEdition, typeData).toPromise();
        this.message = 'Type mis à jour avec succès';
      } else {
        await this.produitService.creerTypeProduit(typeData).toPromise();
        this.message = 'Type créé avec succès';
      }
      
      this.fermerModalType();
      await this.chargerTypesProduit();
      
    } catch (error: any) {
      console.error('Erreur sauvegarde type:', error);
      this.erreur = error.error?.message || 'Erreur lors de la sauvegarde';
    } finally {
      this.chargement = false;
    }
  }

  // Gestion du stock
  ouvrirModalStock(produit: Produit): void {
    this.stockForm = {
      produitId: produit._id,
      nouveauStock: produit.stock.nombreDispo,
      operation: 'definir'
    };
    this.modalStockOuverte = true;
  }

  fermerModalStock(): void {
    this.modalStockOuverte = false;
  }

  async mettreAJourStock(): Promise<void> {
    try {
      this.chargement = true;
      
      // Validation
      if (this.stockForm.nouveauStock < 0) {
        this.erreur = 'Le stock ne peut pas être négatif';
        return;
      }
      
      // Appel API réel pour mise à jour du stock
      const stockData = {
        operation: this.stockForm.operation,
        quantite: this.stockForm.nouveauStock
      };
      
      await this.produitService.mettreAJourStock(this.stockForm.produitId, stockData).toPromise();
      
      this.message = 'Stock mis à jour avec succès';
      this.fermerModalStock();
      await this.chargerProduits();
      
    } catch (error: any) {
      console.error('Erreur mise à jour stock:', error);
      this.erreur = error.error?.message || 'Erreur lors de la mise à jour du stock';
    } finally {
      this.chargement = false;
    }
  }

  // Utilitaires
  getStatutStock(produit: Produit): string {
    if (produit.stock.nombreDispo === 0) return 'rupture';
    if (produit.stock.nombreDispo <= produit.stock.seuilAlerte) return 'faible';
    return 'normal';
  }

  getClasseStock(produit: Produit): string {
    const statut = this.getStatutStock(produit);
    switch (statut) {
      case 'rupture': return 'text-danger';
      case 'faible': return 'text-warning';
      default: return 'text-success';
    }
  }

  filtrerProduits(): void {
    // Logique de filtrage - à implémenter
    this.chargerProduits();
  }

  changerPage(page: number): void {
    this.pageActuelle = page;
    this.chargerProduits();
  }

  effacerMessages(): void {
    this.erreur = '';
    this.message = '';
  }

  toggleTypeAchat(type: TypeAchatEnum, event: any): void {
    if (!this.produitForm.typeAchat) {
      this.produitForm.typeAchat = [];
    }
    
    if (event.target.checked) {
      if (!this.produitForm.typeAchat.includes(type)) {
        this.produitForm.typeAchat.push(type);
      }
    } else {
      this.produitForm.typeAchat = this.produitForm.typeAchat.filter(t => t !== type);
    }
  }
}