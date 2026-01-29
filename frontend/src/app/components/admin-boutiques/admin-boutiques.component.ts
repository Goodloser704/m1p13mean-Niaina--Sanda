import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PendingBoutique } from '../../services/admin.service';

@Component({
  selector: 'app-admin-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-boutiques-container">
      <!-- Header -->
      <div class="admin-header">
        <h2>🏪 Gestion des Boutiques</h2>
        <button class="btn-primary" (click)="loadPendingBoutiques()">
          🔄 Actualiser
        </button>
      </div>

      <!-- Statistiques -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{ pendingBoutiques.length }}</h3>
            <p>En attente</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ approvedToday }}</h3>
            <p>Approuvées aujourd'hui</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <h3>{{ rejectedToday }}</h3>
            <p>Rejetées aujourd'hui</p>
          </div>
        </div>
      </div>

      <!-- Liste des boutiques en attente -->
      <div class="boutiques-section">
        <h3>📋 Boutiques en attente de validation</h3>
        
        <div class="boutiques-list" *ngIf="pendingBoutiques.length > 0">
          <div 
            *ngFor="let boutique of pendingBoutiques" 
            class="boutique-card">
            
            <!-- Info boutique -->
            <div class="boutique-info">
              <div class="boutique-header">
                <h4>{{ boutique.prenom }} {{ boutique.nom }}</h4>
                <span class="status-badge pending">{{ boutique.status }}</span>
              </div>
              
              <div class="boutique-details">
                <p><strong>📧 Email:</strong> {{ boutique.email }}</p>
                <p *ngIf="boutique.telephone"><strong>📞 Téléphone:</strong> {{ boutique.telephone }}</p>
                <p><strong>📅 Inscription:</strong> {{ formatDate(boutique.createdAt) }}</p>
                
                <!-- Informations business si disponibles -->
                <div *ngIf="boutique.businessInfo" class="business-info">
                  <p *ngIf="boutique.businessInfo.description">
                    <strong>📝 Description:</strong> {{ boutique.businessInfo.description }}
                  </p>
                  <p *ngIf="boutique.businessInfo.category">
                    <strong>🏷️ Catégorie:</strong> {{ boutique.businessInfo.category }}
                  </p>
                  <p *ngIf="boutique.businessInfo.siret">
                    <strong>🏢 SIRET:</strong> {{ boutique.businessInfo.siret }}
                  </p>
                  <p *ngIf="boutique.businessInfo.website">
                    <strong>🌐 Site web:</strong> 
                    <a [href]="boutique.businessInfo.website" target="_blank">
                      {{ boutique.businessInfo.website }}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="boutique-actions">
              <button 
                class="btn-approve"
                (click)="approveBoutique(boutique)"
                [disabled]="isProcessing">
                <span *ngIf="!isProcessing">✅ Approuver</span>
                <span *ngIf="isProcessing">⏳ Traitement...</span>
              </button>
              
              <button 
                class="btn-reject"
                (click)="showRejectModal(boutique)"
                [disabled]="isProcessing">
                ❌ Rejeter
              </button>
              
              <button 
                class="btn-details"
                (click)="showBoutiqueDetails(boutique)">
                👁️ Détails
              </button>
            </div>
          </div>
        </div>

        <!-- Message si aucune boutique en attente -->
        <div class="no-boutiques" *ngIf="pendingBoutiques.length === 0">
          <div class="empty-state">
            <span class="empty-icon">🏪</span>
            <h3>Aucune boutique en attente</h3>
            <p>Toutes les demandes d'inscription ont été traitées</p>
          </div>
        </div>
      </div>

      <!-- Modal de rejet -->
      <div class="modal-overlay" *ngIf="showRejectModalFlag" (click)="closeRejectModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>❌ Rejeter la boutique</h3>
            <button class="close-btn" (click)="closeRejectModal()">×</button>
          </div>
          
          <div class="modal-body">
            <p><strong>Boutique :</strong> {{ selectedBoutique?.prenom }} {{ selectedBoutique?.nom }}</p>
            <p><strong>Email :</strong> {{ selectedBoutique?.email }}</p>
            
            <div class="form-group">
              <label for="rejectionReason">Raison du rejet (optionnel) :</label>
              <textarea 
                id="rejectionReason"
                [(ngModel)]="rejectionReason"
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                rows="4">
              </textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeRejectModal()">
              Annuler
            </button>
            <button 
              class="btn-danger" 
              (click)="confirmRejectBoutique()"
              [disabled]="isProcessing">
              <span *ngIf="!isProcessing">❌ Confirmer le rejet</span>
              <span *ngIf="isProcessing">⏳ Traitement...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de détails -->
      <div class="modal-overlay" *ngIf="showDetailsModalFlag" (click)="closeDetailsModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>👁️ Détails de la boutique</h3>
            <button class="close-btn" (click)="closeDetailsModal()">×</button>
          </div>
          
          <div class="modal-body" *ngIf="selectedBoutique">
            <div class="details-grid">
              <div class="detail-section">
                <h4>👤 Informations personnelles</h4>
                <p><strong>Nom :</strong> {{ selectedBoutique.nom }}</p>
                <p><strong>Prénom :</strong> {{ selectedBoutique.prenom }}</p>
                <p><strong>Email :</strong> {{ selectedBoutique.email }}</p>
                <p><strong>Téléphone :</strong> {{ selectedBoutique.telephone || 'Non renseigné' }}</p>
              </div>
              
              <div class="detail-section" *ngIf="selectedBoutique.adresse">
                <h4>📍 Adresse</h4>
                <p>{{ selectedBoutique.adresse.rue || 'Non renseignée' }}</p>
                <p>{{ selectedBoutique.adresse.codePostal }} {{ selectedBoutique.adresse.ville }}</p>
                <p>{{ selectedBoutique.adresse.pays || 'France' }}</p>
              </div>
              
              <div class="detail-section" *ngIf="selectedBoutique.businessInfo">
                <h4>🏢 Informations business</h4>
                <p><strong>Description :</strong> {{ selectedBoutique.businessInfo.description || 'Non renseignée' }}</p>
                <p><strong>Catégorie :</strong> {{ selectedBoutique.businessInfo.category || 'Non renseignée' }}</p>
                <p><strong>SIRET :</strong> {{ selectedBoutique.businessInfo.siret || 'Non renseigné' }}</p>
                <p><strong>Site web :</strong> 
                  <a *ngIf="selectedBoutique.businessInfo.website" 
                     [href]="selectedBoutique.businessInfo.website" 
                     target="_blank">
                    {{ selectedBoutique.businessInfo.website }}
                  </a>
                  <span *ngIf="!selectedBoutique.businessInfo.website">Non renseigné</span>
                </p>
              </div>
              
              <div class="detail-section">
                <h4>📊 Informations système</h4>
                <p><strong>ID :</strong> {{ selectedBoutique._id }}</p>
                <p><strong>Statut :</strong> {{ selectedBoutique.status }}</p>
                <p><strong>Actif :</strong> {{ selectedBoutique.isActive ? 'Oui' : 'Non' }}</p>
                <p><strong>Inscription :</strong> {{ formatDate(selectedBoutique.createdAt) }}</p>
                <p><strong>Dernière MAJ :</strong> {{ formatDate(selectedBoutique.updatedAt) }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeDetailsModal()">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-boutiques-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .admin-header h2 {
      margin: 0;
      color: #333;
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

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }

    .stat-content p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .boutiques-section h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .boutiques-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .boutique-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .boutique-info {
      flex: 1;
    }

    .boutique-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .boutique-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #ffc107;
      color: #856404;
    }

    .boutique-details p {
      margin: 0.5rem 0;
      color: #666;
    }

    .business-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .boutique-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 120px;
    }

    .btn-approve {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s ease;
    }

    .btn-approve:hover:not(:disabled) {
      background: #218838;
    }

    .btn-reject {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s ease;
    }

    .btn-reject:hover:not(:disabled) {
      background: #c82333;
    }

    .btn-details {
      background: #17a2b8;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s ease;
    }

    .btn-details:hover {
      background: #138496;
    }

    .btn-approve:disabled,
    .btn-reject:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .no-boutiques {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-state .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #999;
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

    .modal-content.large {
      max-width: 800px;
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

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      resize: vertical;
    }

    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #eee;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
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

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .detail-section h4 {
      color: #333;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .detail-section p {
      margin: 0.5rem 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .admin-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .boutique-card {
        flex-direction: column;
      }

      .boutique-actions {
        flex-direction: row;
        min-width: auto;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminBoutiquesComponent implements OnInit {
  pendingBoutiques: PendingBoutique[] = [];
  approvedToday = 0;
  rejectedToday = 0;
  isProcessing = false;
  
  // Modal states
  showRejectModalFlag = false;
  showDetailsModalFlag = false;
  selectedBoutique: PendingBoutique | null = null;
  rejectionReason = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPendingBoutiques();
  }

  loadPendingBoutiques() {
    this.adminService.getPendingBoutiques().subscribe({
      next: (response) => {
        this.pendingBoutiques = response.boutiques;
        console.log('✅ Boutiques en attente chargées:', response.count);
      },
      error: (error) => {
        console.error('❌ Erreur chargement boutiques:', error);
        alert('Erreur lors du chargement des boutiques en attente');
      }
    });
  }

  approveBoutique(boutique: PendingBoutique) {
    if (this.isProcessing) return;
    
    const confirm = window.confirm(
      `Êtes-vous sûr de vouloir approuver la boutique "${boutique.prenom} ${boutique.nom}" ?`
    );
    
    if (!confirm) return;
    
    this.isProcessing = true;
    
    this.adminService.approveBoutique(boutique._id).subscribe({
      next: (response) => {
        console.log('✅ Boutique approuvée:', response.message);
        alert('Boutique approuvée avec succès !');
        this.approvedToday++;
        this.loadPendingBoutiques();
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('❌ Erreur approbation boutique:', error);
        alert('Erreur lors de l\'approbation de la boutique');
        this.isProcessing = false;
      }
    });
  }

  showRejectModal(boutique: PendingBoutique) {
    this.selectedBoutique = boutique;
    this.rejectionReason = '';
    this.showRejectModalFlag = true;
  }

  closeRejectModal() {
    this.showRejectModalFlag = false;
    this.selectedBoutique = null;
    this.rejectionReason = '';
  }

  confirmRejectBoutique() {
    if (!this.selectedBoutique || this.isProcessing) return;
    
    this.isProcessing = true;
    
    this.adminService.rejectBoutique(this.selectedBoutique._id, this.rejectionReason).subscribe({
      next: (response) => {
        console.log('❌ Boutique rejetée:', response.message);
        alert('Boutique rejetée');
        this.rejectedToday++;
        this.loadPendingBoutiques();
        this.closeRejectModal();
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('❌ Erreur rejet boutique:', error);
        alert('Erreur lors du rejet de la boutique');
        this.isProcessing = false;
      }
    });
  }

  showBoutiqueDetails(boutique: PendingBoutique) {
    this.selectedBoutique = boutique;
    this.showDetailsModalFlag = true;
  }

  closeDetailsModal() {
    this.showDetailsModalFlag = false;
    this.selectedBoutique = null;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}