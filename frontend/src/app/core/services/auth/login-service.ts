import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  email = "";
  password = "";
  logError = signal<String | null>(null);

  constructor(private http: HttpClient) {}

  // Return un objet Observable (karazana objet Asynchrone afaka anaovana abonnement na subscribe)
  login(loginData: { email: string, password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, loginData); 
  }
}
