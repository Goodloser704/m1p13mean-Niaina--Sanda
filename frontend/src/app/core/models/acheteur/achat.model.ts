import { TypeProduits } from "../../../pages/commercant/ma-boutique/type-produits/type-produits"
import { Produit } from "../commercant/produit.model"
import { TypeProduit } from "../commercant/type-produit.model"
import { Genre, User, UserRole } from "../user.model"
import { Facture } from "./facture.model"

export enum TypeAchat {
  Recuperer = "Recuperer",
  Livrer = "Livrer"
}

export enum EtatAchat {
  EnAttente = "EnAttente",
  Validee = "Validee",
  Annulee = "Annulee"
}

export interface Achat {
  _id: string,
  acheteur: User,
  produit: Produit,
  facture: Facture,
  quantite: number,
  prixUnitaire: number,
  montantTotal: number,
  typeAchat: {
    type: TypeAchat, // enum
    dateDebut: string,
    dateFin: string
  },
  etat: EtatAchat, // enum
  createdAt: string,
  updatedAt: string
}

export interface StatistiquesAchat {
  totalAchats: number,
  montantTotal: number,
  achatsParEtat: {
    _id: EtatAchat,
    count: number,
    montant: number
  }[],
  achatsParMois: {
    _id: { year: number, month: number }
    mois: string,
    count: number,
    montant: number,
  }[],
  boutiquesPreferees: {
    _id: string,
    boutique: string,
    count: number,
    montant: number
  }[]
}

export function createMockAchat(
  overrides?: Partial<Achat>
): Achat {

  const now = new Date().toISOString();

  const mock: Achat = {
    _id: crypto.randomUUID(),

    acheteur: {
      _id: crypto.randomUUID(),
      id: 'USR-001',
      nom: 'Rakoto',
      prenoms: 'Jean',
      genre: Genre.Masculin ?? null,
      email: 'jean.rakoto@email.com',
      telephone: '0340000000',
      mdp: 'hashed-password',
      photo: null,
      role: UserRole.Acheteur,
      createdAt: now,
      updatedAt: now
    },

    produit: {
      _id: crypto.randomUUID(),
      nom: 'Pizza Royale',
      description: 'Pizza fromage et jambon',
      photo: null,
      prix: 25000,
      typeProduit: {
        type: "Nourriture"
      } as TypeProduit,
      boutique: 'BOUTIQUE_ID',
      tempsPreparation: '00:30',
      stock: {
        nombreDispo: 10,
        updatedAt: now
      },
      createdAt: now,
      updatedAt: now,
      isActive: true
    },

    facture: {
      _id: crypto.randomUUID(),
      description: 'Achat test',
      montantTotal: 50000,
      tauxTVA: 20,
      createdAt: now,
      updatedAt: now
    } as any, // adapte selon ton interface Facture

    quantite: 2,
    prixUnitaire: 25000,
    montantTotal: 50000,

    typeAchat: {
      type: TypeAchat.Livrer,
      dateDebut: now,
      dateFin: now
    },

    etat: EtatAchat.EnAttente,

    createdAt: now,
    updatedAt: now
  };

  return {
    ...mock,
    ...overrides
  };
}