import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BoutiqueService, Boutique } from '../../services/boutique.service';

@Component({
  selector: 'app-my-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-boutiques.component.html',
  styleUrl: './my-boutiques.component.scss'
})
export class MyBoutiquesComponent implements OnInit {
  boutiques: Boutique[] = [];
  isLoading = true;
  showCreateForm = false;
  showDeleteModal = false;
  selectedBoutique: Boutique | null = null;
  isDeleting = false;

  constructor(
    private boutiqueService: BoutiqueService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

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
    console.log('Navigation vers formulaire inscription boutique');
    this.router.navigate(['/boutique-registration']);
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