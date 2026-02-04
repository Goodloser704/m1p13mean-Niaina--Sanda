import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreCommercialService, CentreCommercial, CentreCommercialRequest, CentreCommercialStats } from '../../services/centre-commercial.service';

@Component({
  selector: 'app-admin-centre-commercial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-centre-commercial.component.html',
  styleUrl: './admin-centre-commercial.component.scss'
})
export class AdminCentreCommercialComponent implements OnInit {
  // État des données
  centreCommercial: CentreCommercial | null = null;
  stats: CentreCommercialStats | null = null;
  loading = false;
  error = '';
  success = '';

  // Formulaire
  centreForm: CentreCommercialRequest = {
    nom: '',
    description: '',
    adresse: '',
    email: '',
    telephone: '',
    photo: '',
    siteWeb: '',
    horairesGeneraux: [
      { jour: 'Lundi', debut: '08:00', fin: '20:00', ferme: false },
      { jour: 'Mardi', debut: '08:00', fin: '20:00', ferme: false },
      { jour: 'Mercredi', debut: '08:00', fin: '20:00', ferme: false },
      { jour: 'Jeudi', debut: '08:00', fin: '20:00', ferme: false },
      { jour: 'Vendredi', debut: '08:00', fin: '20:00', ferme: false },
      { jour: 'Samedi', debut: '08:00', fin: '21:00', ferme: false },
      { jour: 'Dimanche', debut: '10:00', fin: '18:00', ferme: false }
    ],
    reseauxSociaux: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  };

  // État de l'interface
  showStats = true;
  editMode = false;

  constructor(private centreCommercialService: CentreCommercialService) {}

  ngOnInit() {
    this.chargerDonnees();
  }

  async chargerDonnees() {
    this.loading = true;
    this.error = '';

    try {
      // Charger les informations du centre commercial
      const response = await this.centreCommercialService.obtenirCentreCommercial().toPromise();
      if (response?.centreCommercial) {
        this.centreCommercial = response.centreCommercial;
        this.remplirFormulaire(response.centreCommercial);
      }

      // Charger les statistiques
      const statsResponse = await this.centreCommercialService.obtenirStatistiques().toPromise();
      if (statsResponse) {
        this.stats = statsResponse;
      }

    } catch (error: any) {
      console.error('Erreur chargement centre commercial:', error);
      this.error = error.error?.message || 'Erreur lors du chargement des données';
    } finally {
      this.loading = false;
    }
  }

  remplirFormulaire(centre: CentreCommercial) {
    this.centreForm = {
      nom: centre.nom,
      description: centre.description || '',
      adresse: centre.adresse,
      email: centre.email || '',
      telephone: centre.telephone || '',
      photo: centre.photo || '',
      siteWeb: centre.siteWeb || '',
      horairesGeneraux: centre.horairesGeneraux || this.centreForm.horairesGeneraux,
      reseauxSociaux: {
        facebook: centre.reseauxSociaux?.facebook || '',
        instagram: centre.reseauxSociaux?.instagram || '',
        twitter: centre.reseauxSociaux?.twitter || ''
      }
    };
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.error = '';
    this.success = '';
    
    if (!this.editMode && this.centreCommercial) {
      // Annuler les modifications
      this.remplirFormulaire(this.centreCommercial);
    }
  }

  async sauvegarder() {
    if (!this.validerFormulaire()) return;

    this.loading = true;
    this.error = '';

    try {
      const response = await this.centreCommercialService.modifierCentreCommercial(this.centreForm).toPromise();
      
      if (response) {
        this.success = response.message;
        this.centreCommercial = response.centreCommercial;
        this.editMode = false;
        
        // Recharger les statistiques
        await this.chargerStatistiques();
        
        setTimeout(() => {
          this.success = '';
        }, 3000);
      }

    } catch (error: any) {
      console.error('Erreur sauvegarde centre commercial:', error);
      this.error = error.error?.message || 'Erreur lors de la sauvegarde';
    } finally {
      this.loading = false;
    }
  }

  async chargerStatistiques() {
    try {
      const statsResponse = await this.centreCommercialService.obtenirStatistiques().toPromise();
      if (statsResponse) {
        this.stats = statsResponse;
      }
    } catch (error: any) {
      console.error('Erreur chargement statistiques:', error);
    }
  }

  validerFormulaire(): boolean {
    if (!this.centreForm.nom.trim()) {
      this.error = 'Le nom du centre commercial est requis';
      return false;
    }

    if (!this.centreForm.adresse.trim()) {
      this.error = 'L\'adresse est requise';
      return false;
    }

    if (this.centreForm.email && !this.isValidEmail(this.centreForm.email)) {
      this.error = 'L\'adresse email n\'est pas valide';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  toggleJourFerme(index: number) {
    if (this.centreForm.horairesGeneraux) {
      this.centreForm.horairesGeneraux[index].ferme = !this.centreForm.horairesGeneraux[index].ferme;
    }
  }
}