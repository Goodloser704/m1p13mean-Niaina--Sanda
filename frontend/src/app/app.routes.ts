import { Routes } from '@angular/router';
import { HomeTest } from './pages/home-test/home-test';
import { AuthLayout } from './shared/layout/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '', 
    component: AuthLayout,
    children: []
  },
  { path: 'home', component: HomeTest },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
