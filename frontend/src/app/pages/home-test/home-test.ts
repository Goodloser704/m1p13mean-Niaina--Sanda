import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-test',
  imports: [],
  templateUrl: './home-test.html',
  styleUrl: './home-test.scss',
})
export class HomeTest implements OnInit {
  // Variables pour monitoring
  backendStatus = 'Vérification...';
  backendUrl = environment.apiUrl;
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

  async testApi() {
    this.logMessage('🧪 Test des endpoints API...');
    
    this.http.get(`${this.backendUrl}/health`)
      .subscribe({
        next: (health: any) => {
          this.logMessage(`💚 Health check: ${health.status}`);
          this.logMessage(`🗄️ Base de données: ${health.checks.database}`);
        },
        error: (err) => {
          console.error(err);
          this.logMessage('❌ Health check échoué');
        }
      });
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

  // 🔍 Vérifier la connexion backend
  checkBackendConnection() {
    this.logMessage('🔍 Test de connexion au backend...');
    this.http.get(`${this.backendUrl}/`)
      .subscribe({
        next: (response: any) => {
          this.backendStatus = '✅ Connecté';
          this.logMessage('✅ Backend accessible');
          this.logMessage(`📊 Réponse: ${response.message}`);

          if (response.mongodb?.connected) {
            this.logMessage('✅ Base de données connectée');
          } else {
            this.logMessage('⚠️ Base de données non connectée');
          }
        },
        error: (err) => {
          this.backendStatus = '❌ Erreur';
          this.logMessage('❌ Erreur connexion backend');
          this.logMessage(`🔍 Détail erreur: ${err.error.message || err.status || err.message}`);
          console.error('Backend connection error:', err);
        }
      });
  }
}
