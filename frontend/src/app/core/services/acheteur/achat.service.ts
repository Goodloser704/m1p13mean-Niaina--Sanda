import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Achat, EtatAchat, StatistiquesAchat, TypeAchat } from '../../models/acheteur/achat.model';
import { Pagination } from '../../models/pagination.model';
import { PFTransaction } from '../../models/porte-feuille.model';
import { PanierValidationPayload } from '../../models/acheteur/panier.model';
import { Facture } from '../../models/acheteur/facture.model';

@Injectable({
  providedIn: 'root',
})
export class AchatService {
  apiUrl = environment.apiUrl;
  apiCommercant = `${this.apiUrl}/api/commercant`;
  apiAchat = `${this.apiUrl}/api/achats`;

  constructor(private http: HttpClient) {}

  // ---- Commercant ----

  getCommercantAchats(
    {
      idBoutique,
      etatsAchat,
      typesAchat,
      page,
      limit
    }: {
      idBoutique?: string,
      etatsAchat?: EtatAchat[],
      typesAchat?: TypeAchat[],
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();
    if (idBoutique !== undefined) params = params.set('boutiqueId', idBoutique);
    if (page !== undefined) params = params.set('page', page);
    if (limit !== undefined) params = params.set('limit', limit);
    if (etatsAchat && etatsAchat.length > 0) {
      etatsAchat.forEach(etat => {
        params = params.append("etatsAchat", etat);
      });
    }
    if (typesAchat && typesAchat.length > 0) {
      typesAchat.forEach(type => {
        params = params.append("typesAchat", type);
      });
    }

    return this.http.get<{
      achats: Achat[],
      count: number,
      pagination: Pagination
    }>(
      `${this.apiCommercant}/achats/en-cours`,
      { params }
    );
  }

  validerLivraison(idAchat: string, dureeLivraison: string) {
    return this.http.put<{
      message: string,
      achat: Achat,
      transaction: PFTransaction
    }>(
      `${this.apiCommercant}/achats/${idAchat}/livraison`,
      { dureeLivraison }
    )
  }

  // -- End Commercant --

  // ---- Acheteur ----

  validerPanier(panier: PanierValidationPayload) {
    return this.http.post<{
      message: string,
      facture: Facture,
      achats: Achat[]
    }>(
      `${this.apiAchat}/panier/valider`,
      panier
    )
  }

  getMesAchats({
    page,
    limit,
    typesAchat,
    etatsAchat
  }: {
    page?: number,
    limit?: number,
    typesAchat?: TypeAchat[],
    etatsAchat?: EtatAchat[]
  }) {
    let params = new HttpParams()
    if (page !== undefined) params = params.set('page', page);
    if (limit !== undefined) params = params.set('limit', limit);
    if (typesAchat && typesAchat.length > 0) {
      typesAchat.forEach(type => {
        params = params.append('typesAchat', type);
      })
    }
    if (etatsAchat && etatsAchat.length > 0) {
      etatsAchat.forEach(etat => {
        params = params.append('etatsAchat', etat);
      })
    }

    return this.http.get<{
      achats: Achat[],
      pagination: Pagination
    }>(
      `${this.apiAchat}/en-cours`,
      { params }
    );
  }

  getMonHistoriqueAchats() {
    return this.http.get<{
      achats: Achat[],
      pagination: Pagination
    }>(
      `${this.apiAchat}/historique`
    )
  }

  getStatistiquesAchats() {
    return this.http.get<StatistiquesAchat>(
      `${this.apiAchat}/statistiques`
    )
  }

  getMesFactures({
    page = 1,
    limit = 10,
    dateDebut,
    dateFin
  }: {
    page: number,
    limit: number,
    dateDebut?: string,
    dateFin?: string
  }) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (dateDebut !== undefined) params = params.set('dateDebut', dateDebut);
    if (dateFin !== undefined) params = params.set('dateFin', dateFin);

    return this.http.get<{
      factures: Facture[],
      pagination: Pagination
    }>(
      `${this.apiAchat}/factures`,
      { params }
    );
  }

  getMyFacture(idFacture: string) {
    return this.http.get<{ facture: Facture }>(`${this.apiAchat}/factures/${idFacture}`);
  }

  getAchatById(idAchat: string) {
    return this.http.get<{ achat: Achat }>(`${this.apiAchat}/${idAchat}`);
  }

  annulerAchat(idAchat: string, raison: string = "") {
    return this.http.put<{ message: string, achat: Achat }>(
      `${this.apiAchat}/${idAchat}/annuler`,
      { raison: raison }
    );
  }

  // -- End Acheteur --
}
