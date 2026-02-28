import { computed, Injectable, signal } from '@angular/core';
import { Panier, PanierValidationPayload } from '../../models/acheteur/panier.model';
import { Produit } from '../../models/commercant/produit.model';
import { TypeAchat } from '../../models/acheteur/achat.model';

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

  ajouterProduit(produit: Produit, quantite: number, typeAchat: TypeAchat) {
    const panier = this._panier();
    const existant = panier.achats.find(
      a => a.produitId === produit._id && a.typeAchat === typeAchat
    );

    if (existant) {
      existant.quantite += quantite;
      existant.montantLigne = existant.quantite * existant.prixUnitaire;
    } else {
      panier.achats.push({
        produitId: produit._id,
        nom: produit.nom,
        photo: produit.photo,
        prixUnitaire: produit.prix,
        quantite,
        typeAchat,
        montantLigne: produit.prix * quantite
      });
    }

    this.recalculer();
  }

  supprimerItem(produitId: string, typeAchat: TypeAchat) {
    const panier = this._panier();

    panier.achats = panier.achats.filter(
      a => !(a.produitId === produitId && a.typeAchat === typeAchat)
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

  // -- End Functions --
}
