import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoutiqueService } from '../../../core/services/acheteur/boutique.service';
import { PortefeuilleService } from '../../../core/services/acheteur/portefeuille.service';
import { AchatService } from '../../../core/services/acheteur/achat.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { NgClass, CurrencyPipe } from "@angular/common";
import { FormsModule } from '@angular/forms';

interface Produit {
  _id: string;
  nom: string;
  description?: string;
  prix: number;
  photo?: string;
  stock: { nombreDispo: number };
  typeProduit?: any;
}

interface CartItem {
  produit: Produit;
  quantite: number;
}

@Component({
  selector: 'app-boutique-detail',
  imports: [NgClass, CurrencyPipe, FormsModule],
  templateUrl: './boutique-detail.html',
  styleUrl: './boutique-detail.scss',
})
export class BoutiqueDetail implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  boutiqueService = inject(BoutiqueService);
  portefeuilleService = inject(PortefeuilleService);
  achatService = inject(AchatService);
  loaderService = inject(LoaderService);
  authService = inject(AuthService);

  boutiqueId = signal<string>('');
  boutique = signal<any>(null);
  produits = signal<Produit[]>([]);
  cart = signal<CartItem[]>([]);
  portefeuille = signal<any>(null);

  cartTotal = computed(() => {
    return this.cart().reduce((total, item) => 
      total + (item.produit.prix * item.quantite), 0
    );
  });

  cartItemCount = computed(() => {
    return this.cart().reduce((total, item) => total + item.quantite, 0);
  });

  // Statut d'ouverture de la boutique
  boutiqueStatus = computed(() => {
    const b = this.boutique();
    if (!b) return { estOuverte: false, raison: 'Chargement...' };
    
    // NE PAS vérifier statutBoutique pour l'acheteur
    // On se base uniquement sur les horaires d'ouverture
    
    // Si pas d'horaires, considérer comme ouverte
    if (!b.horairesHebdo || b.horairesHebdo.length === 0) {
      return { estOuverte: true, raison: 'Horaires non définis' };
    }

    // Obtenir le jour actuel
    const now = new Date();
    const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const jourActuel = joursSemaine[now.getDay()];

    // Chercher l'horaire pour ce jour
    const horaireJour = b.horairesHebdo.find((h: any) => h.jour === jourActuel);

    if (!horaireJour) {
      return { estOuverte: false, raison: `Fermé le ${jourActuel}` };
    }

    // Vérifier l'heure actuelle
    const heureActuelle = now.getHours() * 100 + now.getMinutes();
    
    // Convertir les heures au format HHMM (ex: "09:30" -> 930, "14:00" -> 1400)
    const [heureDebutH, heureDebutM] = horaireJour.debut.split(':').map(Number);
    const [heureFinH, heureFinM] = horaireJour.fin.split(':').map(Number);
    const heureDebut = heureDebutH * 100 + heureDebutM;
    const heureFin = heureFinH * 100 + heureFinM;

    if (heureActuelle < heureDebut) {
      return { estOuverte: false, raison: `Ouvre à ${horaireJour.debut}` };
    }

    if (heureActuelle >= heureFin) {
      return { estOuverte: false, raison: `Fermé (fermeture à ${horaireJour.fin})` };
    }

    return { estOuverte: true, raison: `Ouvert jusqu'à ${horaireJour.fin}` };
  });

  // Horaires formatés pour affichage
  horairesFormattes = computed(() => {
    const b = this.boutique();
    if (!b || !b.horairesHebdo || b.horairesHebdo.length === 0) {
      return [];
    }

    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    return joursSemaine.map(jour => {
      const horaire = b.horairesHebdo.find((h: any) => h.jour === jour);
      return {
        jour,
        horaire: horaire ? `${horaire.debut} - ${horaire.fin}` : 'Fermé'
      };
    });
  });

  ngOnInit(): void {
    this.boutiqueId.set(this.route.snapshot.paramMap.get('id') || '');
    if (this.boutiqueId()) {
      this.loadBoutique();
      this.loadProduits();
      this.loadPortefeuille();
    }
  }

  loadBoutique() {
    this.loaderService.show();
    this.boutiqueService.obtenirBoutiqueParId(this.boutiqueId())
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => this.boutique.set(res.boutique),
        error: console.error
      });
  }

  loadProduits() {
    this.loaderService.show();
    this.boutiqueService.obtenirProduitsBoutique(this.boutiqueId())
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => this.produits.set(res.produits || []),
        error: console.error
      });
  }

  loadPortefeuille() {
    this.portefeuilleService.obtenirMonPortefeuille()
      .subscribe({
        next: (res) => this.portefeuille.set(res.portefeuille),
        error: console.error
      });
  }

  addToCart(produit: Produit) {
    const existingItem = this.cart().find(item => item.produit._id === produit._id);
    
    if (existingItem) {
      if (existingItem.quantite < produit.stock.nombreDispo) {
        this.cart.update(items => 
          items.map(item => 
            item.produit._id === produit._id 
              ? { ...item, quantite: item.quantite + 1 }
              : item
          )
        );
      }
    } else {
      this.cart.update(items => [...items, { produit, quantite: 1 }]);
    }
  }

  removeFromCart(produitId: string) {
    this.cart.update(items => items.filter(item => item.produit._id !== produitId));
  }

  updateQuantity(produitId: string, quantite: number) {
    if (quantite <= 0) {
      this.removeFromCart(produitId);
      return;
    }

    this.cart.update(items =>
      items.map(item =>
        item.produit._id === produitId
          ? { ...item, quantite: Math.min(quantite, item.produit.stock.nombreDispo) }
          : item
      )
    );
  }

  checkout() {
    if (this.cart().length === 0) {
      alert('Votre panier est vide');
      return;
    }

    // Vérifier si la boutique est ouverte
    if (!this.boutiqueStatus().estOuverte) {
      alert(`Impossible d'acheter : ${this.boutiqueStatus().raison}`);
      return;
    }

    // Vérifier le solde
    if (this.portefeuille() && this.portefeuille().balance < this.cartTotal()) {
      alert('Solde insuffisant. Veuillez recharger votre portefeuille.');
      return;
    }

    // Créer les achats
    const achats = this.cart().map(item => ({
      produit: item.produit._id,
      quantite: item.quantite,
      prixUnitaire: item.produit.prix,
      typeAchat: 'Recuperer' // Par défaut, à récupérer
    }));

    this.loaderService.show();
    this.achatService.validerPanier(achats, this.cartTotal())
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          alert('Achat effectué avec succès!');
          this.cart.set([]);
          this.loadPortefeuille(); // Recharger le portefeuille
          this.loadProduits(); // Recharger les produits (stock mis à jour)
        },
        error: (err) => {
          console.error('Erreur achat:', err);
          alert(err.error?.message || 'Erreur lors de l\'achat');
        }
      });
  }

  retour() {
    this.router.navigate(['/acheteur/all-boutiques']);
  }
}
