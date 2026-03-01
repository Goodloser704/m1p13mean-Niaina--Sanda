import { CentreCommercial } from '../../models/admin/centre-commercial.model';
import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CentreCommercialService {
  apiUrl: string = `${environment.apiUrl}/api/centre-commercial`;

  private readonly _centreCommercial = signal<CentreCommercial | null>(null);
  readonly centreCommercial = this._centreCommercial.asReadonly();

  // Retourne une objet Centre Commercial par defaut
  getDefault(): CentreCommercial {
    return {
      _id: "1",
      nom: 'Centre Commercial',
      adresse: 'Antananarivo',
      email: 'centre.co@gmail.com',
      telephone: '038 38 038 38',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  constructor(private http: HttpClient) {
    this.refresh();
  }

  // Recharger l'information depuis l'api
  refresh(): void {
    console.log("Refreshing CentreCommercial info");
    this.http.get<{ centreCommercial: CentreCommercial }>(this.apiUrl)
      .subscribe({
        next: (res) => {  
          this._centreCommercial.set((res.centreCommercial));
        },
        error: (err) => console.error(err)
      });
  }

  getCentreCommercial(): Observable<{ centreCommercial: CentreCommercial }> {
    return this.http.get<{ centreCommercial: CentreCommercial }>(this.apiUrl);
  }

  // Mets a jour le Centre Commercial dans la base et dans le service
   updateCentreCommercial(updated: CentreCommercial): Observable<{ centreCommercial: CentreCommercial }> {
    return this.http.put<{ centreCommercial: CentreCommercial }>(this.apiUrl, updated)
      .pipe(
        tap(res => this._centreCommercial.set(res.centreCommercial))
      );
  }
}
