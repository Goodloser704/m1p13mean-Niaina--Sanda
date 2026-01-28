import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Centre Commercial');
  
  showLogin = false;
  email = '';
  password = '';
  
  // 📊 Variables pour monitoring
  backendStatus = 'Vérification...';
  backendUrl = 'https://m1p13mean-niaina-1.onrender.com';
  connectionLogs: string[] = [];
  
  categories = [
    { name: 'Mode', icon: '👗', count: 15 },
    { name: 'Électronique', icon: '📱', count: 8 },
    { name: 'Alimentation', icon: '🍕', count: 12 },
    { name: 'Beauté', icon: '💄', count: 6 },
    { name: 'Sport', icon: '⚽', count: 4 },
    { name: 'Maison', icon: '🏠', count: 10 }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.logMessage('🚀 Frontend Angular SPA démarré');
    this.logMessage(`🌐 URL Backend configurée: ${this.backendUrl}`);
    this.checkBackendConnection();
  }

  // 📊 Fonction de logging
  logMessage(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.connectionLogs.unshift(logEntry);
    
    // Garder seulement les 10 derniers logs
    if (this.connectionLogs.length > 10) {
      this.connectionLogs = this.connectionLogs.slice(0, 10);
    }
  }

  // 🔍 Vérifier la connexion backend
  async checkBackendConnection() {
    this.logMessage('🔍 Test de connexion au backend...');
    
    try {
      const response = await firstValueFrom(this.http.get(`${this.backendUrl}/`)) as any;
      this.backendStatus = '✅ Connecté';
      this.logMessage('✅ Backend accessible');
      this.logMessage(`📊 Réponse: ${response.message}`);
      
      if (response.mongodb?.connected) {
        this.logMessage('✅ Base de données connectée');
      } else {
        this.logMessage('⚠️ Base de données non connectée');
      }
      
    } catch (error: any) {
      this.backendStatus = '❌ Erreur';
      this.logMessage('❌ Erreur connexion backend');
      this.logMessage(`🔍 Détail erreur: ${error.message || error.status}`);
      console.error('Backend connection error:', error);
    }
  }

  // 🔐 Test de connexion avec logs détaillés
  async login() {
    if (!this.email || !this.password) {
      this.logMessage('⚠️ Champs manquants pour la connexion');
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.logMessage(`🔐 Tentative de connexion: ${this.email}`);
    
    try {
      const loginData = { email: this.email, password: this.password };
      this.logMessage('📤 Envoi requête de connexion...');
      
      const response = await firstValueFrom(this.http.post(`${this.backendUrl}/api/auth/login`, loginData)) as any;
      
      this.logMessage('✅ Connexion réussie');
      this.logMessage(`👤 Utilisateur: ${response.user.nom} ${response.user.prenom}`);
      this.logMessage(`🎭 Rôle: ${response.user.role}`);
      this.logMessage('🎫 Token reçu et sauvegardé');
      
      // Sauvegarder le token
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      alert(`Connexion réussie !\nUtilisateur: ${response.user.nom} ${response.user.prenom}\nRôle: ${response.user.role}`);
      
    } catch (error: any) {
      this.logMessage('❌ Échec de la connexion');
      this.logMessage(`🔍 Erreur: ${error.error?.message || error.message}`);
      console.error('Login error:', error);
      
      alert(`Erreur de connexion:\n${error.error?.message || 'Erreur serveur'}`);
    }
  }

  // 🧪 Test de l'API
  async testApi() {
    this.logMessage('🧪 Test des endpoints API...');
    
    try {
      const health = await firstValueFrom(this.http.get(`${this.backendUrl}/health`)) as any;
      this.logMessage(`💚 Health check: ${health.status}`);
      this.logMessage(`🗄️ Base de données: ${health.checks.database}`);
    } catch (error) {
      this.logMessage('❌ Health check échoué');
    }
  }

  // 🔄 Rafraîchir la connexion
  refreshConnection() {
    this.logMessage('🔄 Rafraîchissement de la connexion...');
    this.checkBackendConnection();
  }

  // 🗑️ Vider les logs
  clearLogs() {
    this.connectionLogs = [];
    this.logMessage('🗑️ Logs vidés');
  }
}
