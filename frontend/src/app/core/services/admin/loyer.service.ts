import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoyerPaiement, LoyerStats } from '../../models/commercant/commercant.model';
import { Recepisse } from '../../models/recepisse.model';
import { PFTransaction } from '../../models/porte-feuille.model';
import { Pagination } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class LoyerService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  payerLoyer(data: LoyerPaiement) {
    return this.http.post<{
      message: string,
      recepisse: Recepisse,
      transaction: PFTransaction,
      nouveauSolde: number
    }>(`${this.apiUrl}/api/commercant/loyers/pay`, data);
  }

  // Commercant
  obtenirMesHistoriqueLoyers(page = 1, limit = 10) {
    return this.http.get<{ loyers: PFTransaction[], pagination: Pagination }>(
      `${this.apiUrl}/api/commercant/loyers/historique`
    )
  }

  // Admin
  obtenirHistoriqueLoyers(mois: string /* MM */, annee: string /* YYYY */, page = 1, limit = 10) {
    return this.http.get<{
      loyers: Recepisse[],
      statistiques: LoyerStats,
      pagination: Pagination
    }>(
      `${this.apiUrl}/api/admin/loyers/historique-par-periode`,
      {
        params: {
          mois: mois,
          annee: annee,
          page: page,
          limit: limit
        }
      }
    )
  }

  // Admin
  getStatutPaimentsMoisCourant() {
    return this.http.get<{
      periode: string /* YYYY-MM */,
      moisCourant: {
        annee: number,
        mois: number,
        nomMois: string
      },
      boutiquesPayees: {
        _id: string,
        nom: string,
        commercant: {
          _id: string,
          nom: string,
          prenoms: string,
          email: string,
          telephone: string
        } | null,
        espace: {
          _id: string,
          code: string,
          loyer: number,
          etage: {
            numero: string,
            nom: string
          } | null
        } | null,
        montantPaye: number,
        datePaiement: string,
        numeroRecepisse: string,
        statut: string
      }[],
      boutiquesImpayees: {
        _id: string,
        nom: string,
        commercant: {
          _id: string,
          nom: string,
          prenoms: string,
          email: string,
          telephone: string
        } | null,
        espace: {
          _id: string,
          code: string,
          loyer: number,
          etage: {
            numero: string,
            nom: string
          } | null
        } | null,
        montantDu: number,
        statut: string
      }[],
      statistiques: {
        nombreBoutiquesActives:number,
        nombreBoutiquesPayees: number,
        nombreBoutiquesImpayees: number,
        totalEncaisse: number,
        totalMontantDu: number,
        tauxPaiement: number
      }
    }>(
      `${this.apiUrl}/api/admin/loyers/statut-paiements-mois-courant`
    );
  }
}
