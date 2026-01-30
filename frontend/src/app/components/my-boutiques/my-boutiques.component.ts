import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueService, Boutique } from '../../services/boutique.service';

@Component({
  selector: 'app-my-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-boutiques-container">
      <!-- Header -->
      <div class="boutiques-header">
        <h2>🏪 Mes Boutiques</h2>
        <div class="header-actions">
          <span class="boutiques-count">{{ boutiques.length }} boutique{{ boutiques.length > 1 ? 's' : '' }}</span>
          <button class="btn-debug" (click)="debugComponent()" style="background: #ffc107; color: black; margin-right: 0.5rem;">
            🔍 Debug
          </button>
          <button class="btn-primary" (click)="showCreateForm = true">
            ➕ Nouvelle Boutique
          </button>
        </div>
      </div>

      <!-- Formulaire de création (si demandé) -->
      <div class="create-form-container" *ngIf="showCreateForm">
        <div class="create-form-header">
          <h3>➕ Créer une nouvelle boutique</h3>
          <button class="btn-close" (click)="showCreateForm = false">×</button>
        </div>
        <p class="form-note">Vous pouvez créer plusieurs boutiques avec des spécialités différentes.</p>
        <button class="btn-secondary" (click)="goToRegistration()">
          📝 Aller au formulaire d'inscription
        </button>
      </div>

      <!-- Liste des boutiques -->
      <div class="boutiques-grid" *ngIf="boutiques.length > 0">
        <div 
          *ngFor="let boutique of boutiques" 
          class="boutique-card"
          [class.pending]="boutique.statut === 'en_attente'"
          [class.approved]="boutique.statut === 'approuve'"
          [class.suspended]="boutique.statut === 'suspendu'">
          
          <!-- Header de la carte -->
          <div class="card-header">
            <div class="boutique-title">
              <h3>{{ boutique.nom }}</h3>
              <span class="category-badge">
                {{ getCategoryIcon(boutique.categorie) }} {{ boutique.categorie }}
              </span>
            </div>
            <div class="status-badge" [style.background-color]="getStatusColor(boutique.statut)">
              {{ getStatusText(boutique.statut) }}
            </div>
          </div>

          <!-- Informations boutique -->
          <div class="card-content">
            <p class="description" *ngIf="boutique.description">
              {{ boutique.description }}
            </p>
            
            <div class="boutique-details">
              <div class="detail-item" *ngIf="boutique.emplacement?.zone">
                <span class="detail-icon">📍</span>
                <span>{{ boutique.emplacement?.zone }}</span>
                <span *ngIf="boutique.emplacement?.etage !== undefined"> - Étage {{ boutique.emplacement?.etage }}</span>
              </div>
              
              <div class="detail-item" *ngIf="boutique.contact?.telephone">
                <span class="detail-icon">📞</span>
                <span>{{ boutique.contact?.telephone }}</span>
              </div>
              
              <div class="detail-item" *ngIf="boutique.contact?.email">
                <span class="detail-icon">📧</span>
                <span>{{ boutique.contact?.email }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-icon">📅</span>
                <span>Créée le {{ formatDate(boutique.dateCreation) }}</span>
              </div>
            </div>

            <!-- Horaires résumés -->
            <div class="horaires-summary" *ngIf="boutique.horaires">
              <span class="detail-icon">🕒</span>
              <span>{{ getHorairesSummary(boutique.horaires) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <button class="btn-action btn-view" (click)="viewBoutique(boutique)">
              👁️ Voir
            </button>
            
            <button 
              class="btn-action btn-edit" 
              (click)="editBoutique(boutique)"
              *ngIf="boutique.statut === 'en_attente' || boutique.statut === 'approuve'">
              ✏️ Modifier
            </button>
            
            <button 
              class="btn-action btn-delete" 
              (click)="deleteBoutique(boutique)"
              *ngIf="boutique.statut === 'en_attente'">
              🗑️ Supprimer
            </button>
            
            <button 
              class="btn-action btn-manage" 
              (click)="manageBoutique(boutique)"
              *ngIf="boutique.statut === 'approuve'">
              ⚙️ Gérer
            </button>
          </div>

          <!-- Messages selon le statut -->
          <div class="status-message">
            <div *ngIf="boutique.statut === 'en_attente'" class="message pending-message">
              ⏳ En attente de validation par un administrateur
            </div>
            <div *ngIf="boutique.statut === 'approuve'" class="message approved-message">
              ✅ Boutique active et opérationnelle
            </div>
            <div *ngIf="boutique.statut === 'suspendu'" class="message suspended-message">
              ⚠️ Boutique suspendue - Contactez un administrateur
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucune boutique -->
      <div class="no-boutiques" *ngIf="boutiques.length === 0 && !isLoading">
        <div class="empty-state">
          <span class="empty-icon">🏪</span>
          <h3>Aucune boutique enregistrée</h3>
          <p>Créez votre première boutique pour commencer à vendre dans notre centre commercial</p>
          <button class="btn-primary" (click)="goToRegistration()">
            ➕ Créer ma première boutique
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="isLoading">
        <p>⏳ Chargement de vos boutiques...</p>
      </div>

      <!-- Modal de confirmation suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>🗑️ Supprimer la boutique</h3>
            <button class="close-btn" (click)="closeDeleteModal()">×</button>
          </div>
          
          <div class="modal-body">
            <p><strong>Êtes-vous sûr de vouloir supprimer cette boutique ?</strong></p>
            <p><strong>Nom :</strong> {{ selectedBoutique?.nom }}</p>
            <p><strong>Catégorie :</strong> {{ selectedBoutique?.categorie }}</p>
            <p class="warning">⚠️ Cette action est irréversible.</p>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeDeleteModal()">
              Annuler
            </button>
            <button 
              class="btn-danger" 
              (click)="confirmDeleteBoutique()"
              [disabled]="isDeleting">
              <span *ngIf="!isDeleting">🗑️ Supprimer</span>
              <span *ngIf="isDeleting">⏳ Suppression...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-boutiques-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .boutiques-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .boutiques-header h2 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .boutiques-count {
      color: #666;
      font-weight: 500;
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

    .btn-primary:hover {
      background: #5a67d8;
    }

    .create-form-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 2px dashed #667eea;
    }

    .create-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .create-form-header h3 {
      margin: 0;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
    }

    .form-note {
      color: #666;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    }

    .boutiques-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .boutique-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }

    .boutique-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .boutique-card.pending {
      border-left-color: #ffc107;
    }

    .boutique-card.approved {
      border-left-color: #28a745;
    }

    .boutique-card.suspended {
      border-left-color: #dc3545;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem 1.5rem 1rem;
      background: #f8f9fa;
    }

    .boutique-title h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .category-badge {
      background: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge {
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .card-content {
      padding: 1.5rem;
    }

    .description {
      color: #666;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .boutique-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .detail-icon {
      width: 20px;
      text-align: center;
    }

    .horaires-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
      padding-top: 0.5rem;
      border-top: 1px solid #eee;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1.5rem 1.5rem;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-view {
      background: #17a2b8;
      color: white;
    }

    .btn-edit {
      background: #28a745;
      color: white;
    }

    .btn-delete {
      background: #dc3545;
      color: white;
    }

    .btn-manage {
      background: #667eea;
      color: white;
    }

    .btn-action:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    .status-message {
      padding: 0 1.5rem 1.5rem;
    }

    .message {
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .pending-message {
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

    .no-boutiques {
      text-align: center;
      padding: 4rem 1rem;
    }

    .empty-state .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      color: #666;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 2rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .warning {
      color: #dc3545;
      font-weight: 500;
      margin-top: 1rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #eee;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .boutiques-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        justify-content: space-between;
      }

      .boutiques-grid {
        grid-template-columns: 1fr;
      }

      .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .card-actions {
        justify-content: center;
      }
    }
  `]
})
export class MyBoutiquesComponent implements OnInit {
  boutiques: Boutique[] = [];
  isLoading = true;
  showCreateForm = false;
  showDeleteModal = false;
  selectedBoutique: Boutique | null = null;
  isDeleting = false;

  constructor(private boutiqueService: BoutiqueService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    console.log('🔄 Début chargement boutiques...');
    this.isLoading = true;
    this.cdr.detectChanges(); // Forcer la détection pour le loading
    
    this.boutiqueService.getMyBoutiques().subscribe({
      next: (response) => {
        console.log('✅ Réponse reçue:', response);
        this.boutiques = response.boutiques || [];
        console.log(`✅ ${response.count} boutiques chargées:`, this.boutiques);
        console.log('🔍 Boutiques assignées:', this.boutiques.length);
        
        // Mettre à jour l'état et forcer la détection
        this.isLoading = false;
        this.cdr.detectChanges(); // Forcer la détection de changement
        console.log('🔄 isLoading mis à false et detectChanges appelé:', this.isLoading);
      },
      error: (error) => {
        console.error('❌ Erreur chargement boutiques:', error);
        console.error('❌ Détails erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Forcer la détection même en cas d'erreur
        console.log('🔄 isLoading mis à false (erreur) et detectChanges appelé:', this.isLoading);
        
        // Message d'erreur plus détaillé
        const errorMessage = error.error?.message || error.message || 'Erreur serveur';
        alert(`Erreur lors du chargement de vos boutiques:\n${errorMessage}\n\nStatut: ${error.status || 'Inconnu'}`);
      }
    });
  }

  goToRegistration() {
    // Émettre un événement pour naviguer vers le formulaire d'inscription
    // Ou utiliser le router si configuré
    console.log('Navigation vers formulaire inscription boutique');
    // Pour l'instant, on ferme juste le formulaire de création
    this.showCreateForm = false;
    // TODO: Implémenter navigation
  }

  viewBoutique(boutique: Boutique) {
    console.log('Voir boutique:', boutique.nom);
    // TODO: Implémenter vue détaillée
  }

  editBoutique(boutique: Boutique) {
    console.log('Modifier boutique:', boutique.nom);
    // TODO: Implémenter modification
  }

  manageBoutique(boutique: Boutique) {
    console.log('Gérer boutique:', boutique.nom);
    // TODO: Implémenter gestion (produits, commandes, etc.)
  }

  deleteBoutique(boutique: Boutique) {
    this.selectedBoutique = boutique;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedBoutique = null;
  }

  confirmDeleteBoutique() {
    if (!this.selectedBoutique || this.isDeleting) return;

    this.isDeleting = true;

    this.boutiqueService.deleteBoutique(this.selectedBoutique._id).subscribe({
      next: (response) => {
        console.log('✅ Boutique supprimée:', response.message);
        alert('Boutique supprimée avec succès');
        this.loadBoutiques();
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('❌ Erreur suppression boutique:', error);
        alert(`Erreur lors de la suppression: ${error.error?.message || 'Erreur serveur'}`);
        this.isDeleting = false;
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

  getHorairesSummary(horaires: any): string {
    if (!horaires) return 'Horaires non renseignés';
    
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const horairesList = jours
      .filter(jour => horaires[jour]?.ouverture && horaires[jour]?.fermeture)
      .map(jour => `${horaires[jour].ouverture}-${horaires[jour].fermeture}`);
    
    if (horairesList.length === 0) return 'Horaires non renseignés';
    
    // Si tous les jours ont les mêmes horaires
    const uniqueHoraires = [...new Set(horairesList)];
    if (uniqueHoraires.length === 1) {
      return `${uniqueHoraires[0]} (tous les jours)`;
    }
    
    return `${horairesList.length} jours d'ouverture`;
  }

  debugComponent() {
    console.log('🔍 DEBUG - État actuel du composant:');
    console.log('  isLoading:', this.isLoading);
    console.log('  boutiques.length:', this.boutiques.length);
    console.log('  boutiques:', this.boutiques);
    
    // Forcer le rafraîchissement
    this.isLoading = false;
    this.cdr.detectChanges(); // Forcer la détection de changement
    console.log('  isLoading forcé à false et detectChanges appelé');
    
    alert(`Debug Info:
isLoading: ${this.isLoading}
boutiques.length: ${this.boutiques.length}
Voir console pour plus de détails`);
  }
}