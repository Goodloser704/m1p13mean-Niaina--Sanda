export interface Product {
  _id: string;
  boutique: string | any;
  nom: string;
  description?: string;
  prix: number;
  prixPromo?: number;
  categorie: string;
  sousCategorie?: string;
  images?: string[];
  stock: {
    quantite: number;
    seuil: number;
  };
  caracteristiques?: {
    taille?: string[];
    couleur?: string[];
    marque?: string;
    autres?: any;
  };
  isActive: boolean;
  note: {
    moyenne: number;
    nombreAvis: number;
  };
  dateCreation: Date;
}

export interface CreateProductRequest {
  nom: string;
  description?: string;
  prix: number;
  prixPromo?: number;
  categorie: string;
  sousCategorie?: string;
  images?: string[];
  stock: {
    quantite: number;
    seuil: number;
  };
  caracteristiques?: {
    taille?: string[];
    couleur?: string[];
    marque?: string;
    autres?: any;
  };
}