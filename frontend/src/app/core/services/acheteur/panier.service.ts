import { computed, Injectable, signal } from '@angular/core';
import { Panier, PanierValidationPayload } from '../../models/acheteur/panier.model';
import { Produit } from '../../models/commercant/produit.model';
import { TypeAchat } from '../../models/acheteur/achat.model';

export interface PanierDeleteData {
  idProduit: string,
  typeAchat: TypeAchat
}

export interface PanierAjoutData {
  produit: Produit,
  quantite: number,
  typeAchat: TypeAchat
}

@Injectable({
  providedIn: 'root',
})
export class PanierService {
  private readonly STORAGE_KEY = "panier";

  private _panier = signal<Panier>({
    achats: [],
    montantTotal: 0,
    totalArticles: 0,
    updatedAt: new Date().toISOString()
  });

  panier = this._panier.asReadonly();

  montantTotal = computed(() =>
    this._panier().achats.reduce(
      (total, item) => total + item.montantLigne,
      0
    )
  );

  totalArticles = computed(() =>
    this._panier().achats.reduce(
      (total, item) => total + item.quantite,
      0
    )
  );

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this._panier())
    );
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this._panier.set(JSON.parse(data));
    }
  }

  private recalculer() {
    const panier = this._panier();

    const montantTotal = panier.achats.reduce(
      (total, item) => total + item.montantLigne,
      0
    );

    const totalArticles = panier.achats.reduce(
      (total, item) => total + item.quantite,
      0
    );

    this._panier.set({
      ...panier,
      montantTotal,
      totalArticles,
      updatedAt: new Date().toISOString()
    });

    this.saveToStorage();
  }

  // ---- Functions ----

  ajouterProduit(data: PanierAjoutData) {
    const panier = this._panier();

    const existant = panier.achats.find(
      a => a.produitId === data.produit._id && a.typeAchat === data.typeAchat
    );

    if (existant) {
      existant.quantite += data.quantite;
      existant.montantLigne = existant.quantite * existant.prixUnitaire;
    } else {
      panier.achats.push({
        produitId: data.produit._id,
        nom: data.produit.nom,
        photo: data.produit.photo,
        prixUnitaire: data.produit.prix,
        quantite: data.quantite,
        typeAchat: data.typeAchat,
        montantLigne: data.produit.prix * data.quantite
      });
    }

    this.recalculer();
  }

  supprimerItem(data: PanierDeleteData) {
    const panier = this._panier();

    panier.achats = panier.achats.filter(
      a => !(a.produitId === data.idProduit && a.typeAchat === data.typeAchat)
    );

    this.recalculer();
  }

  vider() {
    this._panier.set({
      achats: [],
      montantTotal: 0,
      totalArticles: 0,
      updatedAt: new Date().toISOString()
    });

    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Générer payload backend
  getPanierValide(): PanierValidationPayload {
    const panier = this._panier();

    return {
      achats: panier.achats.map(item => ({
        produit: item.produitId,
        quantite: item.quantite,
        typeAchat: item.typeAchat,
        prixUnitaire: item.prixUnitaire
      })),
      montantTotal: panier.montantTotal
    };
  }

  getQuantiteDansPanier(produitId: string): number {
    return this._panier().achats
      .filter(item => item.produitId === produitId)
      .reduce((total, item) => total + item.quantite, 0);
  }

  getDisponibleReel(produit: Produit): number {
    const dejaDansPanier = this.getQuantiteDansPanier(produit._id);
    const disponible = produit.stock.nombreDispo - dejaDansPanier;

    return Math.max(0, disponible);
  }

  // -- End Functions --
}
