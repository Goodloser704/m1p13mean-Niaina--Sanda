import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  
  // Routes temporaires pour le test - les composants seront créés plus tard
  { path: 'register', redirectTo: 'login' },
  { path: 'boutiques', redirectTo: '' },
  { path: 'products', redirectTo: '' },
  { path: 'admin', redirectTo: '' },
  { path: 'boutique', redirectTo: '' },
  
  { path: '**', redirectTo: '' }
];