import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { BoutiqueService, BoutiqueRegistration } from '../../services/boutique.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-boutique-registration',
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-registration.component.html',
  styleUrl: './boutique-registration.component.scss'
})
export class BoutiqueRegistrationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSubmitting = false;
  
  boutiqueForm: BoutiqueRegistration = {
    nom: '',
    description: '',
    categorie: 'Mode',
    emplacement: {
      zone: '',
      numeroLocal: '',
      etage: 1
    },
    contact: {
      telephone: '',
      email: '',
      siteWeb: ''
    },
    horaires: {
      lundi: { ouverture: '09:00', fermeture: '18:00' },
      mardi: { ouverture: '09:00', fermeture: '18:00' },
      mercredi: { ouverture: '09:00', fermeture: '18:00' },
      jeudi: { ouverture: '09:00', fermeture: '18:00' },
      vendredi: { ouverture: '09:00', fermeture: '18:00' },
      samedi: { ouverture: '09:00', fermeture: '18:00' },
      dimanche: { ouverture: '10:00', fermeture: '17:00' }
    }
  };

  categories = ['Mode', 'Électronique', 'Alimentation', 'Beauté', 'Sport', 'Maison', 'Autre'] as const;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit() {
    // S'abonner aux changements d'utilisateur
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user?.role !== 'boutique') {
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit() {
    if (!this.boutiqueForm.nom || !this.boutiqueForm.categorie) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;

    this.boutiqueService.registerBoutique(this.boutiqueForm).subscribe({
      next: (response: any) => {
        alert('Boutique créée avec succès ! Elle sera validée par un administrateur.');
        this.router.navigate(['/my-boutiques']);
      },
      error: (error: any) => {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de la boutique');
        this.isSubmitting = false;
      }
    });
  }

  resetForm() {
    this.boutiqueForm = {
      nom: '',
      description: '',
      categorie: 'Mode',
      emplacement: {
        zone: '',
        numeroLocal: '',
        etage: 1
      },
      contact: {
        telephone: '',
        email: '',
        siteWeb: ''
      },
      horaires: {
        lundi: { ouverture: '09:00', fermeture: '18:00' },
        mardi: { ouverture: '09:00', fermeture: '18:00' },
        mercredi: { ouverture: '09:00', fermeture: '18:00' },
        jeudi: { ouverture: '09:00', fermeture: '18:00' },
        vendredi: { ouverture: '09:00', fermeture: '18:00' },
        samedi: { ouverture: '09:00', fermeture: '18:00' },
        dimanche: { ouverture: '10:00', fermeture: '17:00' }
      }
    };
  }

  getJours(): string[] {
    return ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  }

  applyPreset(preset: 'standard' | 'extended' | 'weekend') {
    const presets = {
      standard: {
        lundi: { ouverture: '09:00', fermeture: '18:00' },
        mardi: { ouverture: '09:00', fermeture: '18:00' },
        mercredi: { ouverture: '09:00', fermeture: '18:00' },
        jeudi: { ouverture: '09:00', fermeture: '18:00' },
        vendredi: { ouverture: '09:00', fermeture: '18:00' },
        samedi: { ouverture: '09:00', fermeture: '18:00' },
        dimanche: { ouverture: '10:00', fermeture: '17:00' }
      },
      extended: {
        lundi: { ouverture: '08:00', fermeture: '20:00' },
        mardi: { ouverture: '08:00', fermeture: '20:00' },
        mercredi: { ouverture: '08:00', fermeture: '20:00' },
        jeudi: { ouverture: '08:00', fermeture: '20:00' },
        vendredi: { ouverture: '08:00', fermeture: '20:00' },
        samedi: { ouverture: '08:00', fermeture: '20:00' },
        dimanche: { ouverture: '10:00', fermeture: '19:00' }
      },
      weekend: {
        lundi: { ouverture: '10:00', fermeture: '19:00' },
        mardi: { ouverture: '10:00', fermeture: '19:00' },
        mercredi: { ouverture: '10:00', fermeture: '19:00' },
        jeudi: { ouverture: '10:00', fermeture: '19:00' },
        vendredi: { ouverture: '10:00', fermeture: '19:00' },
        samedi: { ouverture: '10:00', fermeture: '19:00' },
        dimanche: { ouverture: '10:00', fermeture: '19:00' }
      }
    };

    this.boutiqueForm.horaires = presets[preset];
  }

  goBack() {
    this.router.navigate(['/']);
  }
}