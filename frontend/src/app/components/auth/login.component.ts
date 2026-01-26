import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 20px;">
      <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
        <h2 style="text-align: center; margin-bottom: 30px; color: #333;">Connexion</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; color: #555;">Email</label>
            <input 
              type="email" 
              formControlName="email" 
              style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
              placeholder="votre@email.com"
            >
            <div *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched" 
                 style="color: #f44336; font-size: 14px; margin-top: 5px;">
              Email requis
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; color: #555;">Mot de passe</label>
            <input 
              [type]="hidePassword ? 'password' : 'text'" 
              formControlName="password" 
              style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
              placeholder="Votre mot de passe"
            >
            <div *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched" 
                 style="color: #f44336; font-size: 14px; margin-top: 5px;">
              Mot de passe requis
            </div>
          </div>

          <div *ngIf="error" style="color: #f44336; margin-bottom: 20px; padding: 10px; background-color: #ffebee; border-radius: 4px;">
            {{ error }}
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || loading"
            style="width: 100%; padding: 12px; background: #3f51b5; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;"
          >
            <span *ngIf="loading">Connexion...</span>
            <span *ngIf="!loading">Se connecter</span>
          </button>
        </form>
        
        <p style="text-align: center; margin-top: 20px; color: #666;">
          Comptes de test :<br>
          <small>admin&#64;mall.com / admin123</small><br>
          <small>fashion&#64;mall.com / boutique123</small>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      
      // Simulation de connexion
      setTimeout(() => {
        this.loading = false;
        console.log('Tentative de connexion:', this.loginForm.value);
        alert('Connexion simulée - Backend: https://m1p13mean-niaina-1.onrender.com');
      }, 1000);
    }
  }
}