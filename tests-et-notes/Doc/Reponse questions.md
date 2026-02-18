# Questions de Review 



## 🏗️ Architecture et Entités de Base


1. **Le CentreCommercial** - Tu l'as créé manuellement en base  ? Comment tu gères les infos générales (nom, adresse, etc.) ?
=> Le centre commercial creer au debut aura leur valeur par defaut, et comme mentionnés dans le RG (Regles de gestion) sous Admin 
c'est bien mentionnee dedans que l'Admin pourra Modifier ces informations sur le CC (CentreCommercial)

2. **Système de portefeuille** - C'est implémenté ? Je vois pas les modèles `PorteFeuille` et `PFTransaction` dans ton code. Tu comptes faire comment pour les paiements de loyers ?
=> Oui c'est implementé, dans le RG sous 3.2 PorteFeuille, il y a meme un exemple qui explique la cas du transaction du loyer

3. **Les catégories** - Tu as fait les entités `CategorieBoutique` et `TypeProduit` ? L'admin peut ajouter/modifier les catégories comme "Vêtements", "Restaurant", etc. ?
=> Pour "CategorieBoutique" oui, c'est l'Admin qui ajoute et modifier cette section
=> Pour "TypeProduit" c'est le Commercant qui les ajoutes et modifie car ce sera propre a chaque boutique d'avoir le type de produit qu'ils vendent

## 🔐 Authentification et Rôles

4. **Les enums** - Tu utilises des constantes/enums pour éviter les fautes de frappe ? Genre `RoleEnum.Admin` au lieu de `"Admin"` en dur ?
=> Oui

5. **Création des admins** - Comment tu crées les admins manuellement ? Tu as un script ou tu le fais direct en base ?
=> Ecrire une script pour copier/coller et l'inserer manuellement dans la base via MongoDb Compass ou autre outils

6. **Middleware d'auth** - Ça marche bien pour différencier les 3 rôles (Admin/Commerçant/Acheteur) ?
=> Ca depend de ce que l'on va ecrire dans nos code, tant que les Enums sont bien definis ca passera si on le fait bien

## 🏪 Fonctionnalités Boutiques

7. **Demandes de location** - L'entité `DemandeLocation` existe ? L'admin peut valider/refuser les demandes ?
=> oui

8. **Horaires des boutiques** - Comment tu gères les `horairesHebdo` ? Tu vérifies les contraintes (max 7 jours, pas de doublons, début < fin) ?
=> Lors de la creation du boutique, verifier cette attribut horairesHebdo dans le front puis dans le back-end avant de l'inserer dans la base

9. **Statuts des boutiques** - Les statuts "Actif"/"Inactif" sont bien gérés ? Et le passage automatique à "Inactif" quand le commerçant ferme ?
=> Precision: Actif et Inactif ici n'a rien avoir avec horairesHebdo, Actif et Inactif signifie que ce Boutique est il encore present dans le Centre Commercial ou non, le Commercant pourra changer la statutBoutique d'Actif en Inactif et dans ce cas il faut que son espace devient null dans la base ce qui signifie qu'il libere l'espace (faut bien considerer cela dans les Updates du boutique). Concernant fermé/ouvert, ce n'est pas un probleme de back-end on gerera cela via horairesHebdo et l'heure de la machine de l'utilisateur dans le front-end 

## 🛒 Système d'Achats

10. **Le panier** - Tu as fait l'objet Panier comme DTO côté frontend ? Comment ça se passe pour regrouper les achats avant validation ?
=> C'est le role de l'entité facture qui sera creer et partagé entre tout les Achats dans le Panier

11. **Types d'achat** - La distinction "Récupérer" vs "Livrer" est implémentée ? Avec la gestion des dates de préparation/livraison ?
=> "Recuperer" et "Livrer" est defini d'avance en tant qu'Enum que ce soit dans le front ou le back, 
=> La duree de preparation est fournit d'avance lors de l'ajout d'un produit car c'est propre a un produit (par exemple un Tacos dans un boutique de type Restaurant)
=> La date de livraison est deja expliqué dans le RG

12. **Gestion du stock** - Quand quelqu'un achète, le `nombreDispo` se décrémente automatiquement ? Et si y'a plus de stock ?
=> C'est precisé dans le RG quand ce "nombreDispo" sera décrémente et quel sont les traitements et verification a faire

13. **Les factures** - L'entité `Facture` existe ? Tu peux générer des reçus PDF pour les acheteurs ?
=> Oui, facture existe, la generation de recu pdf se fera dans le front-end

## 📊 Dashboard et Stats

14. **Dashboard admin** - Tu as fait toutes les stats demandées ? (nombre de boutiques, taux d'occupation, historique des loyers, etc.)
=> J'ai pas compris la question, mais ces stats seront calculer dans le backe-end avec les traitements correspondant et envoyer avec l'api

15. **Pagination** - Les listes sont paginées comme demandé ? (boutiques, notifications, etc.)
=> Ils le seront, et devront etre

## 🔔 Notifications

16. **Temps réel** - Tu as implémenté Socket.io pour les notifs en temps réel ? Ça marche pour les achats/ventes/paiements ?
=> On est pas encore arrivés la bas 

17. **Marquage lu/non lu** - Les utilisateurs peuvent marquer leurs notifications comme lues ?
=> Ce sera dans le frontend: Il y aura des boutons a coté de chaque notification pour marquer comme lu et la liste des notifications marqué comme lu seront envoyé au back-end

## 🚀 Priorités

18. **Si tu devais choisir 3 trucs à implémenter en priorité**, ce serait quoi ?
=> Commencer avec l'Authentification et porteFeuille 
Puis commencer d'implementer Admin, Commercant, Acheteur de facon parallele, en lisant le RG les fonctionnalités mentionnees dans ces 3 parties (de haut en bas, c'est la priorité ) , enfin finir avec la Notification



---