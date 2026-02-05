import { Routes } from '@angular/router';
import { AuthLayout } from './pages/shared/layout/auth-layout/auth-layout';
import { AcheteurLayout } from './pages/shared/layout/acheteur-layout/acheteur-layout';
import { Login } from './components/auth/login/login';
import { AdminLayout } from './pages/shared/layout/admin-layout/admin-layout';
import { CommercantLayout } from './pages/shared/layout/commercant-layout/commercant-layout';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { UserRole } from './core/models/user';
import { Dashboard } from './pages/admin/dashboard/dashboard';

export const routes: Routes = [
  { path: '**', redirectTo: '' }, // Url inconnue
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '', 
    component: AuthLayout,
    canActivate: [noAuthGuard],
    children: [
      { path: 'login', component: Login },
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'commercant',
    component: CommercantLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Commercant] }, 
    children: []
  },
  {
    path: 'acheteur',
    component: AcheteurLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Acheteur] },
    children: []
  },
];
