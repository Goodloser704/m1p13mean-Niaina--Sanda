import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Espace, EspaceQueryParams, EspacesResponse, EspaceStatut, Etage } from '../../models/admin/espaces.model';
import { Observable } from 'rxjs';
import { buildQueryParams } from '../../helpers/params.helper';

@Injectable({
  providedIn: 'root',
})
export class EspacesService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---- Etages ----

  createFloor(body: { niveau: number }): Observable<{ message: string, etage: Etage }> {
    return this.http.post<{ message: string, etage: Etage }>(`${this.apiUrl}/api/etages`, body);
  }

  getAllFloor(): Observable<{ etages: Etage[] }> {
    return this.http.get<{ etages: Etage[] }>(`${this.apiUrl}/api/etages`);
  }

  updateFloor(etage: Etage): Observable<{ message: string, etage: Etage }> {
    return this.http.put<{ message: string, etage: Etage }>(`${this.apiUrl}/api/etages/${etage._id}`, etage);
  }

  deleteFloor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/etages/${id}`);
  }

  // -- End Etages --

  // ---- Espaces ----

  getAllSpaces(params?: EspaceQueryParams) {
    if (params) {
      params = {
        ...params,
        actifSeulement: true // Recuperer les espaces pas effacee (A cause du soft delete)
      };
    }

    return this.http.get<EspacesResponse>(
      `${this.apiUrl}/api/espaces`,
      { params: buildQueryParams(params) }
    );
  }

  getSpace(espaceId: string) {
    return this.http.get<Espace>(
      `${this.apiUrl}/api/espaces/${espaceId}`
    );
  }

  getAllAvailableSpace() {
    return this.getAllSpaces({
      statut: EspaceStatut.Disponible
    });
  }

  createNewSpace(espace: Espace) {
    return this.http
      .post<{ message: string, espace: Espace }>(
        `${this.apiUrl}/api/espaces`, 
        espace
      );
  }

  editSpace(editedSpace: Espace) {
    return this.http
      .put<{ message: string, espace: Espace }>(
        `${this.apiUrl}/api/espaces/${editedSpace._id}`, 
        editedSpace
      );
  }

  deleteSpace(espaceId: string) {
    return this.http.delete<any>(`${this.apiUrl}/api/espaces/${espaceId}`);
  }

  occuperUneEspace(boutiqueId: string, espaceId: string) {
    return this.http.put<any>(
      `${this.apiUrl}/api/espaces/${espaceId}/occuper`, 
      { boutiqueId: boutiqueId }
    );
  }

  libererUneEspace(espaceId: string) {
    return this.http.put<any>(
      `${this.apiUrl}/api/espaces/${espaceId}/liberer`,
      {}
    )
  }

  // -- End Espaces --
}
