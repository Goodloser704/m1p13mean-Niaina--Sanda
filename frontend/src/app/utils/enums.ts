/**
 * 🎯 ENUMS Frontend - Constantes pour éviter les erreurs de frappe
 * 
 * Important: Utiliser ces enums partout au lieu de chaînes en dur
 * Exemple: if(role === RoleEnum.Admin) au lieu de if(role === "Admin")
 */

// Rôles utilisateur
export enum RoleEnum {
  Admin = 'Admin',
  Commercant = 'Commercant',
  Acheteur = 'Acheteur'
}

// Rôles utilisateur (compatibilité avec l'ancien système)
export enum UserRoleEnum {
  admin = 'admin',
  boutique = 'boutique',
  client = 'client'
}

// Statuts des boutiques
export enum StatutBoutiqueEnum {
  Actif = 'Actif',
  Inactif = 'Inactif',
  EnAttente = 'EnAttente',
  Rejete = 'Rejete'
}

// Statuts des boutiques (compatibilité)
export enum BoutiqueStatutEnum {
  en_attente = 'en_attente',
  approuve = 'approuve',
  suspendu = 'suspendu'
}

// Statuts des espaces
export enum StatutEspaceEnum {
  Disponible = 'Disponible',
  Occupee = 'Occupee'
}

// États des demandes de location
export enum EtatDemandeEnum {
  EnAttente = 'EnAttente',
  Acceptee = 'Acceptee',
  Refusee = 'Refusee'
}

// Types de transactions
export enum TypeTransactionEnum {
  Achat = 'Achat',
  Loyer = 'Loyer',
  Commission = 'Commission'
}

// Types de notifications
export enum TypeNotificationEnum {
  Paiement = 'Paiement',
  Achat = 'Achat',
  Vente = 'Vente'
}

// Types d'achats
export enum TypeAchatEnum {
  Recuperer = 'Recuperer',
  Livrer = 'Livrer'
}

// États des achats
export enum EtatAchatEnum {
  EnAttente = 'EnAttente',
  Validee = 'Validee',
  Annulee = 'Annulee'
}

// Jours de la semaine
export enum JourSemaineEnum {
  Lundi = 'Lundi',
  Mardi = 'Mardi',
  Mercredi = 'Mercredi',
  Jeudi = 'Jeudi',
  Vendredi = 'Vendredi',
  Samedi = 'Samedi',
  Dimanche = 'Dimanche'
}

// Catégories de boutiques (exemples selon les règles)
export enum CategorieBoutiqueEnum {
  Vetements = 'Vetements',
  Telephonie = 'Telephonie',
  Restaurant = 'Restaurant',
  Bijouterie = 'Bijouterie',
  Autres = 'Autres'
}

// Genre
export enum GenreEnum {
  Masculin = 'Masculin',
  Feminin = 'Feminin'
}

// Statuts des factures
export enum StatutFactureEnum {
  Brouillon = 'Brouillon',
  Emise = 'Emise',
  Payee = 'Payee',
  Annulee = 'Annulee'
}

// Modes de paiement
export enum ModePaiementEnum {
  Portefeuille = 'Portefeuille',
  Carte = 'Carte',
  Especes = 'Especes',
  Virement = 'Virement'
}

// Types de reçus
export enum TypeRecepisseEnum {
  Loyer = 'Loyer',
  Caution = 'Caution',
  Frais = 'Frais',
  Remboursement = 'Remboursement',
  Autre = 'Autre'
}

// Statuts des reçus
export enum StatutRecepisseEnum {
  Emis = 'Emis',
  Envoye = 'Envoye',
  Recu = 'Recu',
  Archive = 'Archive'
}

// Priorités des notifications
export enum NotificationPriorityEnum {
  low = 'low',
  medium = 'medium',
  high = 'high',
  urgent = 'urgent'
}

// Types d'actions des notifications
export enum NotificationActionTypeEnum {
  approve_boutique = 'approve_boutique',
  review_order = 'review_order',
  verify_payment = 'verify_payment',
  approve_location = 'approve_location',
  none = 'none'
}

// Utilitaires pour les mappings
export class EnumUtils {
  
  /**
   * Convertir un rôle ancien vers nouveau format
   */
  static mapUserRole(oldRole: string): RoleEnum {
    const mapping: { [key: string]: RoleEnum } = {
      'admin': RoleEnum.Admin,
      'boutique': RoleEnum.Commercant,
      'client': RoleEnum.Acheteur
    };
    return mapping[oldRole] || RoleEnum.Acheteur;
  }

  /**
   * Convertir un rôle nouveau vers ancien format
   */
  static mapToUserRole(newRole: RoleEnum): UserRoleEnum {
    const mapping: { [key in RoleEnum]: UserRoleEnum } = {
      [RoleEnum.Admin]: UserRoleEnum.admin,
      [RoleEnum.Commercant]: UserRoleEnum.boutique,
      [RoleEnum.Acheteur]: UserRoleEnum.client
    };
    return mapping[newRole] || UserRoleEnum.client;
  }

  /**
   * Convertir un statut boutique ancien vers nouveau
   */
  static mapBoutiqueStatut(oldStatut: string): StatutBoutiqueEnum {
    const mapping: { [key: string]: StatutBoutiqueEnum } = {
      'en_attente': StatutBoutiqueEnum.EnAttente,
      'approuve': StatutBoutiqueEnum.Actif,
      'suspendu': StatutBoutiqueEnum.Inactif
    };
    return mapping[oldStatut] || StatutBoutiqueEnum.EnAttente;
  }

  /**
   * Obtenir l'icône d'un rôle
   */
  static getRoleIcon(role: RoleEnum | UserRoleEnum): string {
    const icons: { [key: string]: string } = {
      [RoleEnum.Admin]: '👨‍💼',
      [RoleEnum.Commercant]: '🏪',
      [RoleEnum.Acheteur]: '🛍️',
      [UserRoleEnum.admin]: '👨‍💼',
      [UserRoleEnum.boutique]: '🏪',
      [UserRoleEnum.client]: '🛍️'
    };
    return icons[role] || '👤';
  }

  /**
   * Obtenir la couleur d'un statut
   */
  static getStatutColor(statut: StatutBoutiqueEnum | BoutiqueStatutEnum): string {
    const colors: { [key: string]: string } = {
      [StatutBoutiqueEnum.Actif]: '#28a745',
      [StatutBoutiqueEnum.Inactif]: '#dc3545',
      [StatutBoutiqueEnum.EnAttente]: '#ffc107',
      [BoutiqueStatutEnum.approuve]: '#28a745',
      [BoutiqueStatutEnum.suspendu]: '#dc3545',
      [BoutiqueStatutEnum.en_attente]: '#ffc107'
    };
    return colors[statut] || '#6c757d';
  }

  /**
   * Obtenir l'icône d'un jour de la semaine
   */
  static getJourIcon(jour: JourSemaineEnum): string {
    const icons: { [key in JourSemaineEnum]: string } = {
      [JourSemaineEnum.Lundi]: '📅',
      [JourSemaineEnum.Mardi]: '📅',
      [JourSemaineEnum.Mercredi]: '📅',
      [JourSemaineEnum.Jeudi]: '📅',
      [JourSemaineEnum.Vendredi]: '📅',
      [JourSemaineEnum.Samedi]: '🎉',
      [JourSemaineEnum.Dimanche]: '🎉'
    };
    return icons[jour] || '📅';
  }

  /**
   * Obtenir l'icône d'un type de transaction
   */
  static getTransactionIcon(type: TypeTransactionEnum): string {
    const icons: { [key in TypeTransactionEnum]: string } = {
      [TypeTransactionEnum.Achat]: '🛒',
      [TypeTransactionEnum.Loyer]: '🏠',
      [TypeTransactionEnum.Commission]: '💰'
    };
    return icons[type] || '💳';
  }

  /**
   * Obtenir l'icône d'un état de demande
   */
  static getEtatDemandeIcon(etat: EtatDemandeEnum): string {
    const icons: { [key in EtatDemandeEnum]: string } = {
      [EtatDemandeEnum.EnAttente]: '⏳',
      [EtatDemandeEnum.Acceptee]: '✅',
      [EtatDemandeEnum.Refusee]: '❌'
    };
    return icons[etat] || '❓';
  }

  /**
   * Obtenir la couleur d'un état de demande
   */
  static getEtatDemandeColor(etat: EtatDemandeEnum): string {
    const colors: { [key in EtatDemandeEnum]: string } = {
      [EtatDemandeEnum.EnAttente]: '#ffc107',
      [EtatDemandeEnum.Acceptee]: '#28a745',
      [EtatDemandeEnum.Refusee]: '#dc3545'
    };
    return colors[etat] || '#6c757d';
  }

  /**
   * Vérifier si un utilisateur a un rôle spécifique
   */
  static hasRole(userRole: string, requiredRole: RoleEnum | UserRoleEnum): boolean {
    // Normaliser les rôles pour la comparaison
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRequiredRole = requiredRole.toLowerCase();
    
    // Mappings pour la compatibilité
    const roleMapping: { [key: string]: string[] } = {
      'admin': ['admin', 'Admin'],
      'commercant': ['boutique', 'Commercant'],
      'acheteur': ['client', 'Acheteur']
    };
    
    // Vérification directe
    if (normalizedUserRole === normalizedRequiredRole) {
      return true;
    }
    
    // Vérification avec mapping
    for (const [key, values] of Object.entries(roleMapping)) {
      if (values.map(v => v.toLowerCase()).includes(normalizedUserRole) && 
          values.map(v => v.toLowerCase()).includes(normalizedRequiredRole)) {
        return true;
      }
    }
    
    return false;
  }
}