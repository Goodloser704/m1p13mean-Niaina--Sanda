import { Routes } from '@angular/router';
import { AuthLayout } from './pages/shared/layout/auth-layout/auth-layout';
import { AcheteurLayout } from './pages/shared/layout/acheteur-layout/acheteur-layout';
import { Login } from './components/auth/login/login';
import { AdminLayout } from './pages/shared/layout/admin-layout/admin-layout';
import { CommercantLayout } from './pages/shared/layout/commercant-layout/commercant-layout';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { UserRole } from './core/models/user.model';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { InscriptionChoice } from './components/auth/inscription-choice/inscription-choice';
import { Inscription } from './components/auth/inscription/inscription';
import { MesBoutiques } from './pages/commercant/mes-boutiques/mes-boutiques';
import { AllBoutiques } from './pages/acheteur/all-boutiques/all-boutiques';
import { UserProfil } from './pages/shared/user-profil/user-profil';
import { Notifications } from './pages/shared/notifications/notifications';
import { PorteFeuille } from './pages/shared/porte-feuille/porte-feuille';
import { Espaces } from './pages/admin/espaces/espaces';
import { DemandesLocation } from './pages/admin/demandes-location/demandes-location';
import { BoutiquesAdmin } from './pages/admin/boutiques-admin/boutiques-admin';
import { CreationBoutique } from './pages/commercant/creation-boutique/creation-boutique';
import { MaBoutique } from './pages/commercant/ma-boutique/ma-boutique';
import { TypeProduits } from './pages/commercant/ma-boutique/type-produits/type-produits';
import { GestionProduit } from './pages/commercant/ma-boutique/gestion-produit/gestion-produit';
import { GestionAchats } from './pages/commercant/ma-boutique/gestion-achats/gestion-achats';
import { LocationEspace } from './pages/commercant/ma-boutique/location-espace/location-espace';
import { Loyers } from './pages/commercant/ma-boutique/loyers/loyers';
import { Infos } from './pages/commercant/ma-boutique/infos/infos';
import { BoutiqueHome } from './pages/acheteur/boutique-home/boutique-home';
import { MesAchats } from './pages/acheteur/mes-achats/mes-achats';
import { MonPanier } from './pages/acheteur/mon-panier/mon-panier';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: AuthLayout,
    canActivate: [noAuthGuard],
    children: [
      { path: 'login', component: Login },
      { path: 'inscription-choix', component: InscriptionChoice },
      { path: 'inscription', component: Inscription },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Admin] },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'espaces', component: Espaces },
      { path: 'demandes-location', component: DemandesLocation },
      { path: 'boutiques-admin', component: BoutiquesAdmin },

      { path: 'user-profil', component: UserProfil },
      { path: 'notifications', component: Notifications },
      { path: 'porte-feuille', component: PorteFeuille },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'commercant',
    component: CommercantLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Commercant] },
    children: [
      { path: 'mes-boutiques', component: MesBoutiques },
      { path: 'creation-boutique', component: CreationBoutique },
      {
        path: 'ma-boutique',
        component: MaBoutique,
        children: [
          { path: 'type-produits', component: TypeProduits },
          { path: 'gestion-produit', component: GestionProduit },
          { path: 'gestion-achats', component: GestionAchats },
          { path: 'location-espace', component: LocationEspace },
          { path: 'loyers', component: Loyers },
          { path: 'infos', component: Infos },
          { path: '', redirectTo: 'infos', pathMatch: 'full' }
        ]
      },

      { path: 'user-profil', component: UserProfil },
      { path: 'notifications', component: Notifications },
      { path: 'porte-feuille', component: PorteFeuille },
      { path: '', redirectTo: 'mes-boutiques', pathMatch: 'full' }
    ]
  },
  {
    path: 'acheteur',
    component: AcheteurLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Acheteur] },
    children: [
      { path: 'all-boutiques', component: AllBoutiques },
      { path: 'boutique-home', component: BoutiqueHome },
      { path: 'mes-achats', component: MesAchats },
      { path: 'mon-panier', component: MonPanier },

      { path: 'user-profil', component: UserProfil },
      { path: 'notifications', component: Notifications },
      { path: 'porte-feuille', component: PorteFeuille },
      { path: '', redirectTo: 'all-boutiques', pathMatch: 'full' }
    ]
  },
  // Wildcard URL Inconnu (TOUJOURS A LA FIN)
  { path: '**', redirectTo: 'login' }
];
