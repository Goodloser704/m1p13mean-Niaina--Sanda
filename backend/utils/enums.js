/**
 * 🎯 ENUMS - Constantes pour éviter les erreurs de frappe
 * 
 * Important: Utiliser ces enums partout au lieu de chaînes en dur
 * Exemple: if(role === RoleEnum.Admin) au lieu de if(role === "Admin")
 */

// Rôles utilisateur
const RoleEnum = {
  Admin: 'Admin',
  Commercant: 'Commercant', 
  Acheteur: 'Acheteur'
};

// Statuts des boutiques
const StatutBoutiqueEnum = {
  Actif: 'Actif',
  Inactif: 'Inactif'
  // EnAttente supprimé - Les boutiques sont Inactif par défaut
  // et deviennent Actif quand leur demande de location est approuvée
};

// Statuts des espaces
const StatutEspaceEnum = {
  Disponible: 'Disponible',
  Occupee: 'Occupee'
};

// États des demandes de location
const EtatDemandeEnum = {
  EnAttente: 'EnAttente',
  Acceptee: 'Acceptee',
  Refusee: 'Refusee'
};

// Types de transactions
const TypeTransactionEnum = {
  Achat: 'Achat',
  Loyer: 'Loyer',
  Commission: 'Commission'
};

// Types de notifications
const TypeNotificationEnum = {
  Paiement: 'Paiement',
  Achat: 'Achat',
  Vente: 'Vente'
};

// Types d'achats
const TypeAchatEnum = {
  Recuperer: 'Recuperer',
  Livrer: 'Livrer'
};

// États des achats
const EtatAchatEnum = {
  EnAttente: 'EnAttente',
  Validee: 'Validee',
  Annulee: 'Annulee'
};

// Jours de la semaine
const JourSemaineEnum = {
  Lundi: 'Lundi',
  Mardi: 'Mardi',
  Mercredi: 'Mercredi',
  Jeudi: 'Jeudi',
  Vendredi: 'Vendredi',
  Samedi: 'Samedi',
  Dimanche: 'Dimanche'
};

// Catégories de boutiques (exemples selon les règles)
const CategorieBoutiqueEnum = {
  Vetements: 'Vetements',
  Telephonie: 'Telephonie',
  Restaurant: 'Restaurant',
  Bijouterie: 'Bijouterie',
  Autres: 'Autres'
};

// Genre
const GenreEnum = {
  Masculin: 'Masculin',
  Feminin: 'Feminin'
};

module.exports = {
  RoleEnum,
  StatutBoutiqueEnum,
  StatutEspaceEnum,
  EtatDemandeEnum,
  TypeTransactionEnum,
  TypeNotificationEnum,
  TypeAchatEnum,
  EtatAchatEnum,
  JourSemaineEnum,
  CategorieBoutiqueEnum,
  GenreEnum
};