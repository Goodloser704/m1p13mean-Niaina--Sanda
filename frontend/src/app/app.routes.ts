import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  { 
    path: 'notifications', 
    loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  { 
    path: 'admin-boutiques', 
    loadComponent: () => import('./components/admin-boutiques/admin-boutiques.component').then(m => m.AdminBoutiquesComponent)
  },
  { 
    path: 'admin-etages', 
    loadComponent: () => import('./components/admin-etages/admin-etages.component').then(m => m.AdminEtagesComponent)
  },
  { 
    path: 'admin-espaces', 
    loadComponent: () => import('./components/admin-espaces/admin-espaces.component').then(m => m.AdminEspacesComponent)
  },
  { 
    path: 'boutique-registration', 
    loadComponent: () => import('./components/boutique-registration/boutique-registration.component').then(m => m.BoutiqueRegistrationComponent)
  },
  { 
    path: 'my-boutiques', 
    loadComponent: () => import('./components/my-boutiques/my-boutiques.component').then(m => m.MyBoutiquesComponent)
  },
  { path: '**', redirectTo: '' }
];
