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
import { TemplateLayout } from './pages/shared/layout/template-layout/template-layout';
import { UserProfil } from './pages/shared/user-profil/user-profil';
import { Notifications } from './pages/shared/notifications/notifications';
import { PorteFeuille } from './pages/shared/porte-feuille/porte-feuille';
import { Espaces } from './pages/admin/espaces/espaces';

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


      { path: 'user-profil', component: UserProfil },
      { path: 'notifications', component: Notifications },
      { path: 'porte-feuille', component: PorteFeuille },
      { path: '', redirectTo: 'all-boutiques', pathMatch: 'full' }
    ]
  },
  // Juste pour voir l'adaptation du template sur angular
  {
    path: 'template',
    component: TemplateLayout
  },
  // Wildcard URL Inconnu (TOUJOURS A LA FIN)
  { path: '**', redirectTo: 'login' }
];
