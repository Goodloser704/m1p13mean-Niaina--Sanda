import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Centre Commercial');
  
  showLogin = false;
  email = '';
  password = '';
  
  categories = [
    { name: 'Mode', icon: '👗', count: 15 },
    { name: 'Électronique', icon: '📱', count: 8 },
    { name: 'Alimentation', icon: '🍕', count: 12 },
    { name: 'Beauté', icon: '💄', count: 6 },
    { name: 'Sport', icon: '⚽', count: 4 },
    { name: 'Maison', icon: '🏠', count: 10 }
  ];

  login() {
    if (this.email && this.password) {
      alert(`Connexion simulée pour: ${this.email}\nBackend: https://m1p13mean-niaina-1.onrender.com/api/auth/login`);
      console.log('Login attempt:', { email: this.email, password: this.password });
    } else {
      alert('Veuillez remplir tous les champs');
    }
  }
}
