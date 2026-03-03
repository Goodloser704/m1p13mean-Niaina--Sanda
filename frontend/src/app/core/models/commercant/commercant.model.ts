export interface LoyerPaiement {
  boutiqueId: string,
  montant: number,
  periode: string //YYYY-MM
}

export interface PaiementsMoisCourantResponse {
  periode: string;
  moisCourant: {
    annee: number;
    mois: number;
    nomMois: string;
  };
  boutiquesPayees: {
    _id: string;
    nom: string;
    montantDu: number;
    montantPaye: number;
    paiements: {
      datePaiement: string;
      numeroRecepisse: string;
      montant: number;
    }[];
    statut: string;
  }[];
  boutiquesImpayees: {
    _id: string;
    nom: string;
    montantDu: number;
    statut: string;
  }[];
  statistiques: {
    nombreBoutiquesActives: number;
    nombreBoutiquesPayees: number;
    nombreBoutiquesImpayees: number;
    totalEncaisse: number;
    totalMontantDu: number;
    tauxPaiement: number;
  };
}

export interface PaiementsMoisCourantDetails {
  periode: string /* YYYY-MM */,
  moisCourant: {
    annee: number,
    mois: number,
    nomMois: string
  },
  boutiquesPayees: {
    _id: string,
    nom: string,
    commercant: {
      _id: string,
      nom: string,
      prenoms: string,
      email: string,
      telephone: string
    } | null,
    espace: {
      _id: string,
      code: string,
      loyer: number,
      etage: {
        numero: string,
        nom: string
      } | null
    } | null,
    montantDu: number,
    montantPaye: number,
    paiements: {
      datePaiement: string;
      numeroRecepisse: string;
      montant: number;
    }[];
    statut: string
  }[],
  boutiquesImpayees: {
    _id: string,
    nom: string,
    commercant: {
      _id: string,
      nom: string,
      prenoms: string,
      email: string,
      telephone: string
    } | null,
    espace: {
      _id: string,
      code: string,
      loyer: number,
      etage: {
        numero: string,
        nom: string
      } | null
    } | null,
    montantDu: number,
    statut: string
  }[],
  statistiques: {
    nombreBoutiquesActives:number,
    nombreBoutiquesPayees: number,
    nombreBoutiquesImpayees: number,
    totalEncaisse: number,
    totalMontantDu: number,
    tauxPaiement: number
  }
}

export interface LoyerStats {
  totalMontant: number,
  nombrePaiements: number,
  montantMoyen: number,
  montantMin: number,
  montantMax: number
}