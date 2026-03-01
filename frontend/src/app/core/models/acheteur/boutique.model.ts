export interface Boutique {
  _id: string;
  nom: string;
  description?: string;
  photo?: string;
  commercant: {
    _id: string;
    nom: string;
    prenoms: string;
  };
  categorie?: {
    _id: string;
    categorie: string;
  };
  espace?: {
    _id: string;
    code: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
