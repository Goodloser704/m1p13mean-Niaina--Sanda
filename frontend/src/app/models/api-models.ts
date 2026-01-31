/**
 * 📊 Modèles de Données API - Types TypeScript
 * 
 * Ce fichier contient toutes les interfaces TypeScript correspondant
 * exactement aux modèles backend pour éviter les erreurs d'intégration.
 * 
 * ⚠️ IMPORTANT: Ces interfaces doivent rester synchronisées avec les modèles backend
 */

// ============================================================================
// 🔧 Types de Base et Utilitaires
// ============================================================================

export type ObjectId = string;

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  page?: number;
  limit?: number;
  total?: number;
}

// ============================================================================
// 👤 Modèle User (Utilisateur)
// ============================================================================

export type UserRole = 'admin' | 'boutique' | 'client';
export type UserStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserAddress {
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
}

export interface BusinessInfo {
  siret?: string;
  description?: string;
  category?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface User {
  _id: ObjectId;
  id: ObjectId; // Alias pour _id (utilisé par certains endpoints)
  email: string;
  role: UserRole;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: UserAddress | string; // Peut être string ou objet selon l'endpoint
  isActive: boolean;
  
  // Champs de profil personnel
  dateNaissance?: string;
  genre?: 'homme' | 'femme' | 'autre';
  
  // Champs spécifiques aux propriétaires de boutique
  nomBoutique?: string;
  descriptionBoutique?: string;
  categorieActivite?: string;
  numeroSiret?: string;
  adresseBoutique?: string;
  
  // Champs spécifiques aux boutiques (legacy)
  status?: UserStatus;
  approvedBy?: ObjectId;
  approvedAt?: string;
  rejectedBy?: ObjectId;
  rejectedAt?: string;
  rejectionReason?: string;
  businessInfo?: BusinessInfo;
  
  dateCreation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
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
  adresse?: string;
}

// ============================================================================
// 🏪 Modèle Boutique
// ============================================================================

export type BoutiqueCategorie = 'Mode' | 'Électronique' | 'Alimentation' | 'Beauté' | 'Sport' | 'Maison' | 'Autre';
export type BoutiqueStatut = 'en_attente' | 'approuve' | 'suspendu';

export interface BoutiqueEmplacement {
  zone?: string;
  numeroLocal?: string;
  etage?: number;
}

export interface BoutiqueContact {
  telephone?: string;
  email?: string;
  siteWeb?: string;
}

export interface BoutiqueHoraire {
  ouverture?: string;
  fermeture?: string;
}

export interface BoutiqueHoraires {
  lundi?: BoutiqueHoraire;
  mardi?: BoutiqueHoraire;
  mercredi?: BoutiqueHoraire;
  jeudi?: BoutiqueHoraire;
  vendredi?: BoutiqueHoraire;
  samedi?: BoutiqueHoraire;
  dimanche?: BoutiqueHoraire;
}

export interface BoutiqueNote {
  moyenne: number;
  nombreAvis: number;
}

export interface BoutiqueProprietaire {
  _id: ObjectId;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

export interface Boutique {
  _id: ObjectId;
  proprietaire: BoutiqueProprietaire | ObjectId; // Peut être populé ou non
  nom: string;
  description?: string;
  categorie: BoutiqueCategorie;
  emplacement?: BoutiqueEmplacement;
  contact?: BoutiqueContact;
  horaires?: BoutiqueHoraires;
  images?: string[];
  logo?: string;
  statut: BoutiqueStatut;
  note: BoutiqueNote;
  dateCreation: string;
}

export interface BoutiqueRegistration {
  nom: string;
  description?: string;
  categorie: BoutiqueCategorie;
  emplacement?: BoutiqueEmplacement;
  contact?: BoutiqueContact;
  horaires?: BoutiqueHoraires;
  images?: string[];
  logo?: string;
}

export interface BoutiqueResponse {
  message: string;
  boutique: Partial<Boutique>;
}

export interface BoutiquesResponse {
  boutiques: Boutique[];
  count: number;
}

export interface BoutiqueStatsResponse {
  parStatut: Array<{ _id: string; count: number }>;
  total: number;
  parCategorie: Array<{ _id: string; count: number }>;
}

// ============================================================================
// 🔔 Modèle Notification
// ============================================================================

export type NotificationType = 
  | 'boutique_registration' 
  | 'boutique_approved' 
  | 'boutique_rejected' 
  | 'order_placed' 
  | 'payment_received' 
  | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationActionType = 
  | 'approve_boutique' 
  | 'review_order' 
  | 'verify_payment' 
  | 'none';

export type EntityType = 'User' | 'Boutique' | 'Order' | 'Product';

export interface NotificationRelatedEntity {
  entityType: EntityType;
  entityId: ObjectId;
}

export interface Notification {
  _id: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  recipient: ObjectId;
  recipientRole: UserRole;
  relatedEntity?: NotificationRelatedEntity;
  data: any; // Données supplémentaires flexibles
  isRead: boolean;
  isArchived: boolean;
  priority: NotificationPriority;
  actionRequired: boolean;
  actionType: NotificationActionType;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  count: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

// ============================================================================
// 📦 Modèle Product (Produit)
// ============================================================================

export interface ProductStock {
  quantite: number;
  seuil: number;
}

export interface ProductCaracteristiques {
  taille?: string[];
  couleur?: string[];
  marque?: string;
  autres?: any;
}

export interface ProductNote {
  moyenne: number;
  nombreAvis: number;
}

export interface Product {
  _id: ObjectId;
  boutique: ObjectId | Boutique; // Peut être populé ou non
  nom: string;
  description?: string;
  prix: number;
  prixPromo?: number;
  categorie: string;
  sousCategorie?: string;
  images: string[];
  stock: ProductStock;
  caracteristiques: ProductCaracteristiques;
  isActive: boolean;
  note: ProductNote;
  dateCreation: string;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
}

// ============================================================================
// 🛒 Modèle Order (Commande)
// ============================================================================

export type OrderStatut = 
  | 'en_attente' 
  | 'confirme' 
  | 'prepare' 
  | 'pret' 
  | 'livre' 
  | 'annule';

export type ModePaiement = 'carte' | 'especes' | 'cheque' | 'virement';

export interface OrderProductOptions {
  taille?: string;
  couleur?: string;
}

export interface OrderProduct {
  produit: ObjectId | Product; // Peut être populé ou non
  quantite: number;
  prix: number;
  options?: OrderProductOptions;
}

export interface OrderAdresseLivraison {
  nom: string;
  rue: string;
  ville: string;
  codePostal: string;
  telephone: string;
}

export interface Order {
  _id: ObjectId;
  client: ObjectId | User; // Peut être populé ou non
  boutique: ObjectId | Boutique; // Peut être populé ou non
  produits: OrderProduct[];
  montantTotal: number;
  statut: OrderStatut;
  modePaiement: ModePaiement;
  adresseLivraison?: OrderAdresseLivraison;
  notes?: string;
  dateCommande: string;
  dateLivraison?: string;
}

export interface OrdersResponse {
  orders: Order[];
  count: number;
}

// ============================================================================
// 🔧 Types Utilitaires pour les Formulaires
// ============================================================================

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: FormError[];
}

// ============================================================================
// 🎨 Types pour l'Interface Utilisateur
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// 🌐 Types pour les Réponses d'Erreur
// ============================================================================

export interface ApiError {
  message: string;
  status: number;
  error?: any;
  timestamp?: string;
  path?: string;
}

export interface HttpErrorResponse {
  error: ApiError;
  status: number;
  statusText: string;
  message: string;
}

// ============================================================================
// 📊 Types pour les Statistiques et Dashboards
// ============================================================================

export interface StatItem {
  _id: string;
  count: number;
  label?: string;
  color?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalBoutiques: number;
  totalOrders: number;
  totalRevenue: number;
  boutiquesParStatut: StatItem[];
  boutiquesParCategorie: StatItem[];
  ordersParStatut: StatItem[];
}

// ============================================================================
// 🔍 Types pour la Recherche et Filtrage
// ============================================================================

export interface SearchFilters {
  query?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  boutique?: string;
  sortBy?: 'name' | 'price' | 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: SearchFilters;
}

// ============================================================================
// 📱 Types pour les Composants UI
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  disabled?: boolean;
}

export interface ModalConfig {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

// ============================================================================
// 🎯 Types exportés - Utilisez les imports nommés
// ============================================================================

// Tous les types sont exportés individuellement ci-dessus
// Utilisez: import { User, Boutique, ApiResponse } from './api-models';