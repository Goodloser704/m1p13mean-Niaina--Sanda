export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'boutique' | 'client';
  telephone?: string;
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  isActive: boolean;
  dateCreation: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'boutique' | 'client';
  telephone?: string;
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}