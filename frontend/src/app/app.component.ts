import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #3f51b5;">🏬 Centre Commercial</h1>
      <p>Application de gestion de centre commercial</p>
      <div style="margin: 20px 0;">
        <button style="padding: 10px 20px; background: #3f51b5; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Connexion
        </button>
      </div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'Centre Commercial';
}