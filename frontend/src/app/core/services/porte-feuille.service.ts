import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UserPorteFeuille } from '../models/porte-feuille';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PorteFeuilleService {
  apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  obtenirMonPorteFeuille(userId: string): Observable<UserPorteFeuille> {
    return this.http.get<UserPorteFeuille>(`${this.apiUrl}/api/users/${userId}/wallet`);
  }
}
