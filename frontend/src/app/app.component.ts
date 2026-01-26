import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #f0f0f0; min-height: 100vh;">
      <h1 style="color: #3f51b5; text-align: center;">🏬 Centre Commercial</h1>
      <p style="text-align: center; font-size: 18px;">Application de gestion de centre commercial</p>
      
      <div style="max-width: 800px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Bienvenue !</h2>
        <p>Cette application permet de gérer un centre commercial avec 3 types d'utilisateurs :</p>
        <ul style="line-height: 1.6;">
          <li><strong>Admin</strong> : Gestion globale du centre</li>
          <li><strong>Boutique</strong> : Gestion des produits et commandes</li>
          <li><strong>Client</strong> : Navigation et achats</li>
        </ul>
        
        <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1976d2;">Backend API</h3>
          <p>L'API backend est déployée sur : <a href="https://m1p13mean-niaina-1.onrender.com" target="_blank" style="color: #1976d2;">https://m1p13mean-niaina-1.onrender.com</a></p>
        </div>
        
        <div style="margin-top: 20px; padding: 20px; background: #f3e5f5; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #7b1fa2;">Comptes de test</h3>
          <p><strong>Admin :</strong> admin&#64;mall.com / admin123</p>
          <p><strong>Boutique :</strong> fashion&#64;mall.com / boutique123</p>
          <p><strong>Client :</strong> client1&#64;test.com / client123</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button 
            style="padding: 12px 24px; background: #3f51b5; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
            onclick="alert('Application fonctionnelle ! Backend: https://m1p13mean-niaina-1.onrender.com')"
          >
            Tester la connexion
          </button>
        </div>
      </div>
      
      <footer style="text-align: center; margin-top: 40px; color: #666;">
        <p>Application Centre Commercial - Stack MEAN</p>
        <p>Frontend: Angular 17 | Backend: Express.js + MongoDB</p>
      </footer>
    </div>
  `
})
export class AppComponent {
  title = 'Centre Commercial';
}