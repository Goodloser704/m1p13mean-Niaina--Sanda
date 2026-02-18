# Questions de Review 



## 🏗️ Architecture et Entités de Base


1. **Le CentreCommercial** - Tu l'as créé manuellement en base  ? Comment tu gères les infos générales (nom, adresse, etc.) ?

2. **Système de portefeuille** - C'est implémenté ? Je vois pas les modèles `PorteFeuille` et `PFTransaction` dans ton code. Tu comptes faire comment pour les paiements de loyers ?

3. **Les catégories** - Tu as fait les entités `CategorieBoutique` et `TypeProduit` ? L'admin peut ajouter/modifier les catégories comme "Vêtements", "Restaurant", etc. ?

## 🔐 Authentification et Rôles

4. **Les enums** - Tu utilises des constantes/enums pour éviter les fautes de frappe ? Genre `RoleEnum.Admin` au lieu de `"Admin"` en dur ?

5. **Création des admins** - Comment tu crées les admins manuellement ? Tu as un script ou tu le fais direct en base ?

6. **Middleware d'auth** - Ça marche bien pour différencier les 3 rôles (Admin/Commerçant/Acheteur) ?

## 🏪 Fonctionnalités Boutiques

7. **Demandes de location** - L'entité `DemandeLocation` existe ? L'admin peut valider/refuser les demandes ?

8. **Horaires des boutiques** - Comment tu gères les `horairesHebdo` ? Tu vérifies les contraintes (max 7 jours, pas de doublons, début < fin) ?

9. **Statuts des boutiques** - Les statuts "Actif"/"Inactif" sont bien gérés ? Et le passage automatique à "Inactif" quand le commerçant ferme ?

## 🛒 Système d'Achats

10. **Le panier** - Tu as fait l'objet Panier comme DTO côté frontend ? Comment ça se passe pour regrouper les achats avant validation ?

11. **Types d'achat** - La distinction "Récupérer" vs "Livrer" est implémentée ? Avec la gestion des dates de préparation/livraison ?

12. **Gestion du stock** - Quand quelqu'un achète, le `nombreDispo` se décrémente automatiquement ? Et si y'a plus de stock ?

13. **Les factures** - L'entité `Facture` existe ? Tu peux générer des reçus PDF pour les acheteurs ?

## 📊 Dashboard et Stats

14. **Dashboard admin** - Tu as fait toutes les stats demandées ? (nombre de boutiques, taux d'occupation, historique des loyers, etc.)

15. **Pagination** - Les listes sont paginées comme demandé ? (boutiques, notifications, etc.)

## 🔔 Notifications

16. **Temps réel** - Tu as implémenté Socket.io pour les notifs en temps réel ? Ça marche pour les achats/ventes/paiements ?

17. **Marquage lu/non lu** - Les utilisateurs peuvent marquer leurs notifications comme lues ?

## 🚀 Priorités

18. **Si tu devais choisir 3 trucs à implémenter en priorité**, ce serait quoi ?



---