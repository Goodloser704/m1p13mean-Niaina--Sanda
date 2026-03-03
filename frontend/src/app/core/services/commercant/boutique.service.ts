import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Boutique, BoutiqueStatsResponse, JourSemaine, StatutBoutique } from '../../models/commercant/boutique.model';
import { Pagination } from '../../models/pagination.model';
import { Produit } from '../../models/commercant/produit.model';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  apiUrl = environment.apiUrl;

  readonly BOUTIQUE_KEY = "current_boutique";
  private _currentBoutique = signal<Boutique | null>(null);
  readonly currentBoutique = this._currentBoutique.asReadonly();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const stored = localStorage.getItem(this.BOUTIQUE_KEY);
    if (stored) {
      this._currentBoutique.set(JSON.parse(stored));
    }
  }

  setCurrentBoutique(currentBoutique: Boutique) {
    this._currentBoutique.set(currentBoutique);
    localStorage.setItem(this.BOUTIQUE_KEY, JSON.stringify(currentBoutique));
  }

  freeCurrentBoutique() {
    this._currentBoutique.set(null);
    localStorage.removeItem(this.BOUTIQUE_KEY);
  }

  allerVersBoutique(boutique: Boutique, componentPath?: string) {
    this.setCurrentBoutique(boutique);

    let path = '/commercant/ma-boutique';
    if (componentPath !== undefined) path = componentPath;
    this.router.navigate([path]);
  }

  quitterBoutique(route: string) {
    this.freeCurrentBoutique();
    this.router.navigate([route]);
  }

  isBoutiqueOuverte = computed(() => {
    const boutique = this.currentBoutique();

    if (!boutique || !boutique.horairesHebdo?.length) {
      return false;
    }

    const now = new Date();

    const joursMap: Record<number, JourSemaine> = {
      1: JourSemaine.Lundi,
      2: JourSemaine.Mardi,
      3: JourSemaine.Mercredi,
      4: JourSemaine.Jeudi,
      5: JourSemaine.Vendredi,
      6: JourSemaine.Samedi,
      0: JourSemaine.Dimanche,
    };

    const jourActuel = joursMap[now.getDay()];

    const horaireDuJour = boutique.horairesHebdo.find(
      h => h.jour === jourActuel
    );

    if (!horaireDuJour) return false;

    const heureActuelle = now.getHours() * 60 + now.getMinutes();

    const [debutH, debutM] = horaireDuJour.debut.split(':').map(Number);
    const [finH, finM] = horaireDuJour.fin.split(':').map(Number);

    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;

    return heureActuelle >= debutMinutes && heureActuelle <= finMinutes;
  });

  isBoutiqueOuverteFlexible = computed(() => {
    const boutique = this.currentBoutique();
    if (!boutique?.horairesHebdo?.length) return false;

    const now = new Date();

    const joursMap: Record<number, JourSemaine> = {
      1: JourSemaine.Lundi,
      2: JourSemaine.Mardi,
      3: JourSemaine.Mercredi,
      4: JourSemaine.Jeudi,
      5: JourSemaine.Vendredi,
      6: JourSemaine.Samedi,
      0: JourSemaine.Dimanche,
    };

    const jourActuel = joursMap[now.getDay()];
    const jourPrecedent = joursMap[(now.getDay() + 6) % 7];

    const heureActuelle = now.getHours() * 60 + now.getMinutes();

    const horaires = boutique.horairesHebdo;

    const plagesDuJour = horaires.filter(h => h.jour === jourActuel);
    const plagesJourPrecedent = horaires.filter(h => h.jour === jourPrecedent);

    const estDansPlage = (debut: string, fin: string): boolean => {
      const [debutH, debutM] = debut.split(':').map(Number);
      const [finH, finM] = fin.split(':').map(Number);

      const debutMin = debutH * 60 + debutM;
      const finMin = finH * 60 + finM;

      if (debutMin <= finMin) {
        // Cas normal
        return heureActuelle >= debutMin && heureActuelle <= finMin;
      } else {
        // Cas traverse minuit
        return heureActuelle >= debutMin || heureActuelle <= finMin;
      }
    };

    // 1️⃣ Vérifie plages normales du jour
    for (const plage of plagesDuJour) {
      if (estDansPlage(plage.debut, plage.fin)) {
        return true;
      }
    }

    // 2️⃣ Vérifie plages du jour précédent qui traversent minuit
    for (const plage of plagesJourPrecedent) {
      const [debutH, debutM] = plage.debut.split(':').map(Number);
      const [finH, finM] = plage.fin.split(':').map(Number);

      const debutMin = debutH * 60 + debutM;
      const finMin = finH * 60 + finM;

      if (debutMin > finMin) {
        // traverse minuit
        if (heureActuelle <= finMin) {
          return true;
        }
      }
    }

    return false;
  });

  // ---- API ----

  searchBoutique(keyword: string, page = 1, limit = 10) {
    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutiques/search`,
      {
        params: {
          keyword: keyword,
          page: page,
          limit: limit
        }
      }
    );
  }

  getBoutiqueProduits({
    idBoutique, 
    page = 1, 
    limit = 10,
    disponibleOnly = false,
    statutBoutique,
  }: {
    idBoutique: string,
    page?: number,
    limit?: number,
    disponibleOnly?: boolean,
    statutBoutique?: StatutBoutique
  }) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (disponibleOnly !== undefined) {
      params = params.set('disponibleOnly', disponibleOnly);
    }

    if (statutBoutique !== undefined) {
      params = params.set('statutBoutique', statutBoutique);
    }

    return this.http.get<{ produits: Produit[], boutique: Boutique, pagination: Pagination }>(
      `${this.apiUrl}/api/boutiques/${idBoutique}/produits`,
      { params }
    );
  }

  getCommercantBoutiques(idCommercant: string) {
    return this.http.get<{ boutiques: Boutique[] }>(
      `${this.apiUrl}/api/commercant/${idCommercant}/boutiques`
    );
  }

  getBoutiqueById(idBoutique: string) {
    return this.http.get<{ boutique: Boutique }>(
      `${this.apiUrl}/api/commercant/boutique/${idBoutique}`
    );
  }

  creerBoutique(boutique: Boutique) {
    return this.http.post<{ message: string, boutique: Boutique }>(
      `${this.apiUrl}/api/boutique/register`,
      boutique
    )
  }

  getMyBoutiques() {
    return this.http.get<{ boutiques: Boutique[], count: number }>(
      `${this.apiUrl}/api/boutique/my-boutiques`
    );
  }

  getMyBoutique(idBoutique: string) {
    return this.http.get<{ boutique: Boutique }>(
      `${this.apiUrl}/api/boutique/me/${idBoutique}`
    );
  }

  // en attente
  getPendingBoutiques() {
    return this.http.get<{ boutiques: Boutique[], count: number }>(
      `${this.apiUrl}/api/boutique/pending`
    );
  }

  updateMyBoutique(boutique: Boutique) {
    return this.http.put<{ message: string, boutique: Boutique }>(
      `${this.apiUrl}/api/boutique/me/${boutique._id}`,
      boutique
    );
  }

  deleteMyBoutique(idBoutique: string) {
    return this.http.delete<any>(`${this.apiUrl}/api/boutique/me/${idBoutique}`);
  }

  getAllBoutiques(page = 1, limit = 10) {
    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutique/all`,
      {
        params: {
          page: page,
          limit: limit
        }
      }
    )
  }

  getAllBoutiqueByStatut(statutBoutique: StatutBoutique, page = 1, limit = 10) {
    return this.http.get<{ boutiques: Boutique[], pagination: Pagination }>(
      `${this.apiUrl}/api/boutique/by-statut`,
      {
        params: {
          statut: statutBoutique,
          page: page,
          limit: limit
        }
      }
    );
  }

  getBoutiqueStats() {
    return this.http.get<BoutiqueStatsResponse>(`${this.apiUrl}/api/boutique/admin/stats`);
  }

  // -- End API --

}
