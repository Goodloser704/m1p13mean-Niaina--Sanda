import { Injectable } from '@angular/core';
import { DemandeLocation, DemandeLocationResponse, EtatDemandeLocation } from '../../models/admin/demande-location.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DemandesLocationService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenirMesDemandes(etat = EtatDemandeLocation.EnAttente, page = 1, limit = 10) {
    return this.http.get<DemandeLocationResponse>(
      `${this.apiUrl}/demandes-location/me`,
      {
        params: { etat: etat, page: page, limit: limit }
      }
    );
  }

  obtenirDemandesParEtat(etat: EtatDemandeLocation, page = 1, limit = 10) {
    return this.http
      .get<DemandeLocationResponse>(
        `${this.apiUrl}/api/demandes-location/etat/${etat}`,
        {
          params: { page: page, limit: limit }
        }
      );
  }

  creerDemande(boutiqueId: string, espaceId: string) {
    return this.http.post<{ message: string, demande: DemandeLocation }>(
      `${this.apiUrl}/api/demandes-location`, 
      {
        boutiqueId: boutiqueId,
        espaceId: espaceId,
      }
    );
  }

  accepterDemande(idDemande: string) {
    return this.http.put<{ message: string, demande: DemandeLocation }>(
      `${this.apiUrl}/api/demandes-location/${idDemande}/accepter`,
      {}
    )
  }

  refuserDemande(idDemande: string) {
    return this.http.put<{ message: string, demande: DemandeLocation }>(
      `${this.apiUrl}/api/demandes-location/${idDemande}/refuser`,
      { raisonRefus: '' }
    )
  }

  effacerDemande(idDemande: string) {
    return this.http.delete<any>(`${this.apiUrl}/api/demandes-location/${idDemande}`);
  }
}
