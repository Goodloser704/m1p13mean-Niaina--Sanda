import { Routes } from '@angular/router';
import { HomeTest } from './pages/home-test/home-test';

export const routes: Routes = [
  { path: 'home', component: HomeTest },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
