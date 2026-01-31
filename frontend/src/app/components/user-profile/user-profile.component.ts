import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/api-models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  isEditing = false;
  showPasswordForm = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      adresse: [''],
      dateNaissance: [''],
      genre: [''],
      // Champs spécifiques selon le type d'utilisateur
      nomBoutique: [''],
      descriptionBoutique: [''],
      categorieActivite: [''],
      numeroSiret: [''],
      adresseBoutique: ['']
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Convertir le User du service vers le User des modèles
        this.currentUser = {
          _id: user.id,
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role as any,
          telephone: user.telephone,
          adresse: user.adresse,
          isActive: true,
          dateCreation: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.populateForm(this.currentUser);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      dateNaissance: user.dateNaissance ? new Date(user.dateNaissance).toISOString().split('T')[0] : '',
      genre: user.genre || '',
      // Champs boutique si propriétaire
      nomBoutique: user.nomBoutique || '',
      descriptionBoutique: user.descriptionBoutique || '',
      categorieActivite: user.categorieActivite || '',
      numeroSiret: user.numeroSiret || '',
      adresseBoutique: user.adresseBoutique || ''
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Annuler les modifications
      this.populateForm(this.currentUser!);
    }
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  onSubmitProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      // Solution temporaire : Afficher un message d'information
      alert('⚠️ Fonctionnalité en cours de déploiement\n\nLa modification du profil sera disponible après la mise à jour du serveur.\n\nPour l\'instant, vous pouvez consulter vos informations en mode lecture seule.');
      
      console.log('Données du profil à sauvegarder:', this.profileForm.value);
      this.isEditing = false;
    }
  }

  onSubmitPassword(): void {
    if (this.passwordForm.valid) {
      // Solution temporaire : Afficher un message d'information
      alert('⚠️ Fonctionnalité en cours de déploiement\n\nLe changement de mot de passe sera disponible après la mise à jour du serveur.');
      
      this.showPasswordForm = false;
      this.passwordForm.reset();
    }
  }

  deleteAccount(): void {
    alert('⚠️ Fonctionnalité en cours de déploiement\n\nLa suppression de compte sera disponible après la mise à jour du serveur.');
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get f() { return this.profileForm.controls; }
  get pf() { return this.passwordForm.controls; }

  // Méthodes utilitaires
  isProprietaire(): boolean {
    return this.currentUser?.role === 'boutique';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isClient(): boolean {
    return this.currentUser?.role === 'client';
  }

  getRoleLabel(): string {
    switch (this.currentUser?.role) {
      case 'admin': return 'Administrateur';
      case 'boutique': return 'Propriétaire de boutique';
      case 'client': return 'Client';
      default: return 'Utilisateur';
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['email']) return 'Email invalide';
      if (field.errors['minlength']) return `${fieldName} trop court`;
      if (field.errors['pattern']) return `${fieldName} invalide`;
    }
    return '';
  }

  getPasswordError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return 'Minimum 6 caractères';
      if (field.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}