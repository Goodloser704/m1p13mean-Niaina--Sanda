import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Etage } from '../../models/admin/espaces.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EspacesService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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
}
