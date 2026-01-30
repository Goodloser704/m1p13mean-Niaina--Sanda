import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueService, BoutiqueRegistration, Boutique } from '../../services/boutique.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-boutique-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="boutique-registration-container">
      <!-- Header -->
      <div class="registration-header">
        <h2>➕ Créer une Nouvelle Boutique</h2>
        <p class="subtitle">Ajoutez une nouvelle boutique à votre portfolio dans notre centre commercial</p>
      </div>

      <!-- Formulaire d'inscription -->
      <div class="registration-form">
        <form (ngSubmit)="submitRegistration()" #registrationForm="ngForm">
          
          <!-- Informations de base -->
          <div class="form-section">
            <h3>📝 Informations de base</h3>
            
            <div class="form-group">
              <label for="nom">Nom de la boutique *</label>
              <input 
                type="text" 
                id="nom" 
                [(ngModel)]="boutiqueData.nom" 
                name="nom"
                placeholder="Ex: Fashion Store, Tech Corner..."
                required
                maxlength="100">
            </div>

            <div class="form-group">
              <label for="categorie">Catégorie *</label>
              <select id="categorie" [(ngModel)]="boutiqueData.categorie" name="categorie" required>
                <option value="">Sélectionnez une catégorie</option>
                <option value="Mode">👗 Mode</option>
                <option value="Électronique">📱 Électronique</option>
                <option value="Alimentation">🍕 Alimentation</option>
                <option value="Beauté">💄 Beauté</option>
                <option value="Sport">⚽ Sport</option>
                <option value="Maison">🏠 Maison</option>
                <option value="Autre">🏪 Autre</option>
              </select>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                [(ngModel)]="boutiqueData.description" 
                name="description"
                placeholder="Décrivez votre boutique, vos produits, votre spécialité..."
                rows="4"
                maxlength="500"></textarea>
              <small>{{ boutiqueData.description?.length || 0 }}/500 caractères</small>
            </div>
          </div>

          <!-- Emplacement -->
          <div class="form-section">
            <h3>📍 Emplacement souhaité</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="zone">Zone préférée</label>
                <select id="zone" [(ngModel)]="boutiqueData.emplacement!.zone" name="zone">
                  <option value="">Aucune préférence</option>
                  <option value="Centre">Centre - Zone principale</option>
                  <option value="Nord">Nord - Entrée principale</option>
                  <option value="Sud">Sud - Zone restauration</option>
                  <option value="Est">Est - Zone loisirs</option>
                  <option value="Ouest">Ouest - Zone services</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="etage">Étage préféré</label>
                <select id="etage" [(ngModel)]="boutiqueData.emplacement!.etage" name="etage">
                  <option [ngValue]="null">Aucune préférence</option>
                  <option [ngValue]="0">Rez-de-chaussée</option>
                  <option [ngValue]="1">1er étage</option>
                  <option [ngValue]="2">2ème étage</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="numeroLocal">Numéro de local souhaité (optionnel)</label>
              <input 
                type="text" 
                id="numeroLocal" 
                [(ngModel)]="boutiqueData.emplacement!.numeroLocal" 
                name="numeroLocal"
                placeholder="Ex: A12, B05..."
                maxlength="10">
            </div>
          </div>

          <!-- Contact -->
          <div class="form-section">
            <h3>📞 Informations de contact</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="telephone">Téléphone</label>
                <input 
                  type="tel" 
                  id="telephone" 
                  [(ngModel)]="boutiqueData.contact!.telephone" 
                  name="telephone"
                  placeholder="Ex: 01 23 45 67 89">
              </div>
              
              <div class="form-group">
                <label for="email">Email boutique</label>
                <input 
                  type="email" 
                  id="email" 
                  [(ngModel)]="boutiqueData.contact!.email" 
                  name="email"
                  placeholder="contact@maboutique.com">
              </div>
            </div>

            <div class="form-group">
              <label for="siteWeb">Site web (optionnel)</label>
              <input 
                type="url" 
                id="siteWeb" 
                [(ngModel)]="boutiqueData.contact!.siteWeb" 
                name="siteWeb"
                placeholder="https://www.maboutique.com">
            </div>
          </div>

          <!-- Horaires -->
          <div class="form-section">
            <h3>🕒 Horaires d'ouverture</h3>
            <p class="section-note">Indiquez vos horaires souhaités (peuvent être ajustés selon les règles du centre commercial)</p>
            
            <div class="horaires-grid">
              <div *ngFor="let jour of jours" class="horaire-row">
                <div class="jour-label">
                  <strong>{{ jour | titlecase }}</strong>
                </div>
                <div class="horaire-inputs">
                  <input 
                    type="time" 
                    [value]="getHoraireValue(jour, 'ouverture')" 
                    (input)="setHoraireValue(jour, 'ouverture', $any($event.target).value)"
                    [name]="jour + '_ouverture'"
                    placeholder="Ouverture">
                  <span class="separator">-</span>
                  <input 
                    type="time" 
                    [value]="getHoraireValue(jour, 'fermeture')" 
                    (input)="setHoraireValue(jour, 'fermeture', $any($event.target).value)"
                    [name]="jour + '_fermeture'"
                    placeholder="Fermeture">
                </div>
              </div>
            </div>

            <div class="horaires-presets">
              <p>Horaires types :</p>
              <button type="button" class="btn-preset" (click)="setHorairesPreset('standard')">
                📅 Standard (9h-19h, fermé dimanche)
              </button>
              <button type="button" class="btn-preset" (click)="setHorairesPreset('etendu')">
                🕐 Étendu (8h-20h, 10h-18h dimanche)
              </button>
              <button type="button" class="btn-preset" (click)="clearHoraires()">
                🗑️ Effacer
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="isSubmitting || !registrationForm.valid">
              <span *ngIf="!isSubmitting">➕ Créer la boutique</span>
              <span *ngIf="isSubmitting">⏳ Création en cours...</span>
            </button>
          </div>

          <!-- Note importante -->
          <div class="important-note">
            <h4>ℹ️ Information</h4>
            <ul>
              <li>Vous pouvez créer plusieurs boutiques avec des spécialités différentes</li>
              <li>Chaque boutique sera examinée individuellement par notre équipe</li>
              <li>Vous recevrez une notification une fois votre boutique validée</li>
              <li>L'emplacement final sera attribué selon la disponibilité</li>
              <li>Les horaires peuvent être ajustés selon les règles du centre commercial</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .boutique-registration-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .registration-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .registration-header h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
    }

    .existing-boutique {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .alert {
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .alert-info {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .boutique-info p {
      margin: 0.5rem 0;
    }

    .status-badge {
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-message {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 6px;
    }

    .waiting-message {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .approved-message {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .suspended-message {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .registration-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .form-section {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .form-section:last-child {
      border-bottom: none;
    }

    .form-section h3 {
      color: #333;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .section-note {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group small {
      color: #666;
      font-size: 0.8rem;
    }

    .horaires-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .horaire-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      align-items: center;
      gap: 1rem;
    }

    .jour-label {
      text-align: right;
    }

    .horaire-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .horaire-inputs input {
      flex: 1;
      margin: 0;
    }

    .separator {
      color: #666;
      font-weight: bold;
    }

    .horaires-presets {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .horaires-presets p {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .btn-preset {
      background: #f8f9fa;
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-preset:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .form-actions {
      padding: 1.5rem;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .important-note {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 1rem;
      margin: 1.5rem;
      margin-bottom: 0;
    }

    .important-note h4 {
      color: #856404;
      margin-bottom: 0.5rem;
    }

    .important-note ul {
      color: #856404;
      margin: 0;
      padding-left: 1.5rem;
    }

    .important-note li {
      margin-bottom: 0.25rem;
    }

    .actions {
      margin-top: 1rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .horaire-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .jour-label {
        text-align: left;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class BoutiqueRegistrationComponent implements OnInit {
  existingBoutique: Boutique | null = null;
  showRegistrationForm = false;
  isSubmitting = false;

  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  boutiqueData: BoutiqueRegistration = {
    nom: '',
    description: '',
    categorie: 'Mode',
    emplacement: {
      zone: '',
      numeroLocal: '',
      etage: undefined
    },
    contact: {
      telephone: '',
      email: '',
      siteWeb: ''
    },
    horaires: {
      lundi: { ouverture: '', fermeture: '' },
      mardi: { ouverture: '', fermeture: '' },
      mercredi: { ouverture: '', fermeture: '' },
      jeudi: { ouverture: '', fermeture: '' },
      vendredi: { ouverture: '', fermeture: '' },
      samedi: { ouverture: '', fermeture: '' },
      dimanche: { ouverture: '', fermeture: '' }
    }
  };

  constructor(
    private boutiqueService: BoutiqueService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Ne plus charger de boutique existante puisqu'on peut en avoir plusieurs
    // L'utilisateur peut créer autant de boutiques qu'il veut
    this.showRegistrationForm = true;
  }

  loadExistingBoutique() {
    // Méthode conservée pour compatibilité mais ne fait plus rien
    // Le système multi-boutiques ne nécessite plus cette vérification
    console.log('Mode multi-boutiques : pas de vérification de boutique existante');
  }

  submitRegistration() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    this.boutiqueService.registerBoutique(this.boutiqueData).subscribe({
      next: (response) => {
        console.log('✅ Inscription boutique réussie:', response.message);
        alert(`Inscription réussie !\n\n${response.message}\n\nVous recevrez une notification une fois votre boutique validée.`);
        
        // Recharger les données
        this.loadExistingBoutique();
        this.showRegistrationForm = false;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Erreur inscription boutique:', error);
        alert(`Erreur d'inscription :\n${error.error?.message || 'Erreur serveur'}`);
        this.isSubmitting = false;
      }
    });
  }

  setHorairesPreset(preset: 'standard' | 'etendu') {
    if (preset === 'standard') {
      const horairesStandard = { ouverture: '09:00', fermeture: '19:00' };
      this.jours.slice(0, 6).forEach(jour => {
        if (this.boutiqueData.horaires && this.boutiqueData.horaires[jour]) {
          this.boutiqueData.horaires[jour] = { ...horairesStandard };
        }
      });
      if (this.boutiqueData.horaires && this.boutiqueData.horaires['dimanche']) {
        this.boutiqueData.horaires['dimanche'] = { ouverture: '', fermeture: '' };
      }
    } else if (preset === 'etendu') {
      const horairesEtendu = { ouverture: '08:00', fermeture: '20:00' };
      this.jours.slice(0, 6).forEach(jour => {
        if (this.boutiqueData.horaires && this.boutiqueData.horaires[jour]) {
          this.boutiqueData.horaires[jour] = { ...horairesEtendu };
        }
      });
      if (this.boutiqueData.horaires && this.boutiqueData.horaires['dimanche']) {
        this.boutiqueData.horaires['dimanche'] = { ouverture: '10:00', fermeture: '18:00' };
      }
    }
  }

  clearHoraires() {
    this.jours.forEach(jour => {
      if (this.boutiqueData.horaires && this.boutiqueData.horaires[jour]) {
        this.boutiqueData.horaires[jour] = { ouverture: '', fermeture: '' };
      }
    });
  }

  getCategoryIcon(category: string): string {
    return this.boutiqueService.getCategoryIcon(category);
  }

  getStatusColor(status: string): string {
    return this.boutiqueService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'approuve': return 'Approuvée';
      case 'suspendu': return 'Suspendue';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getHoraireValue(jour: string, type: 'ouverture' | 'fermeture'): string {
    return this.boutiqueData.horaires?.[jour]?.[type] || '';
  }

  setHoraireValue(jour: string, type: 'ouverture' | 'fermeture', value: string): void {
    if (!this.boutiqueData.horaires) {
      this.boutiqueData.horaires = {};
    }
    if (!this.boutiqueData.horaires[jour]) {
      this.boutiqueData.horaires[jour] = {};
    }
    this.boutiqueData.horaires[jour][type] = value;
  }
}