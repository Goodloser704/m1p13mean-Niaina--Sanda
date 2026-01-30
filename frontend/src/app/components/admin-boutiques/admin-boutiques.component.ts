import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { BoutiqueService } from '../../services/boutique.service';
import { NotificationService } from '../../services/notification.service';
import { Boutique } from '../../models/api-models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-boutiques',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-boutiques.component.html',
  styleUrl: './admin-boutiques.component.scss'
})
export class AdminBoutiquesComponent implements OnInit, OnDestroy {
  boutiques: Boutique[] = [];
  isLoading = true;
  currentUser: User | null = null;
  selectedBoutique: Boutique | null = null;
  showDetails = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // S'abonner aux changements d'utilisateur
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user?.role === 'admin') {
          this.loadBoutiques();
        } else {
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBoutiques() {
    this.isLoading = true;
    this.boutiqueService.getPendingBoutiques().subscribe({
      next: (response: any) => {
        this.boutiques = response.boutiques || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des boutiques:', error);
        this.isLoading = false;
      }
    });
  }

  approveBoutique(boutiqueId: string) {
    this.adminService.approveBoutique(boutiqueId).subscribe({
      next: () => {
        this.loadBoutiques();
        alert('Boutique approuvée avec succès');
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'approbation:', error);
        alert('Erreur lors de l\'approbation');
      }
    });
  }

  rejectBoutique(boutiqueId: string) {
    const reason = prompt('Raison du rejet (optionnel):');
    this.adminService.rejectBoutique(boutiqueId, reason || '').subscribe({
      next: () => {
        this.loadBoutiques();
        alert('Boutique rejetée');
      },
      error: (error: any) => {
        console.error('Erreur lors du rejet:', error);
        alert('Erreur lors du rejet');
      }
    });
  }

  viewDetails(boutique: Boutique) {
    this.selectedBoutique = boutique;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedBoutique = null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approuve': return '#28a745';
      case 'en_attente': return '#ffc107';
      case 'suspendu': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approuve': return '✅';
      case 'en_attente': return '⏳';
      case 'suspendu': return '❌';
      default: return '❓';
    }
  }

  formatHoraire(horaire: any): string {
    if (!horaire || !horaire.ouverture || !horaire.fermeture) {
      return 'Fermé';
    }
    return `${horaire.ouverture} - ${horaire.fermeture}`;
  }

  // Helper methods pour gérer le type union proprietaire
  getProprietaireEmail(proprietaire: any): string {
    if (typeof proprietaire === 'object' && proprietaire?.email) {
      return proprietaire.email;
    }
    return '';
  }

  getProprietaireTelephone(proprietaire: any): string {
    if (typeof proprietaire === 'object' && proprietaire?.telephone) {
      return proprietaire.telephone;
    }
    return '';
  }

  getProprietaireNom(proprietaire: any): string {
    if (typeof proprietaire === 'object' && proprietaire?.nom) {
      return proprietaire.nom;
    }
    return '';
  }

  getProprietairePrenom(proprietaire: any): string {
    if (typeof proprietaire === 'object' && proprietaire?.prenom) {
      return proprietaire.prenom;
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/']);
  }
}