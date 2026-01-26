export interface Boutique {
  _id: string;
  proprietaire: string;
  nom: string;
  description?: string;
  categorie: 'Mode' | 'Électronique' | 'Alimentation' | 'Beauté' | 'Sport' | 'Maison' | 'Autre';
  emplacement?: {
    zone: string;
    numeroLocal: string;
    etage: number;
  };
  contact?: {
    telephone: string;
    email: string;
    siteWeb: string;
  };
  horaires?: {
    [key: string]: {
      ouverture: string;
      fermeture: string;
    };
  };
  images?: string[];
  logo?: string;
  statut: 'en_attente' | 'approuve' | 'suspendu';
  note: {
    moyenne: number;
    nombreAvis: number;
  };
  dateCreation: Date;
}

export interface CreateBoutiqueRequest {
  nom: string;
  description?: string;
  categorie: string;
  emplacement?: {
    zone: string;
    numeroLocal: string;
    etage: number;
  };
  contact?: {
    telephone: string;
    email: string;
    siteWeb: string;
  };
  horaires?: {
    [key: string]: {
      ouverture: string;
      fermeture: string;
    };
  };
}