import { Routes } from '@angular/router';
import { AuthLayout } from './pages/shared/layout/auth-layout/auth-layout';
import { AcheteurLayout } from './pages/shared/layout/acheteur-layout/acheteur-layout';
import { Login } from './components/auth/login/login';

export const routes: Routes = [
  {
    path: '', 
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'acheteur',
    component: AcheteurLayout,
    children: []
  },
  { path: '**', redirectTo: '' } // Url inconnue
];
