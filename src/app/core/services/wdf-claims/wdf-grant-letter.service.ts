import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GrantLetter } from '@core/model/wdf-claims/wdf-grant-letter.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GrantLetterService {
  public wdfClaimInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: HttpClient) {}

  public sendEmailGrantLetter(establishmentId: string, name: string, email: string): Observable<GrantLetter> {
    return this.http.post<GrantLetter>(`/api/establishment/${establishmentId}/wdfClaims/grantLetter`, { name, email });
  }

  public resetService(): void {
    this.wdfClaimInProgress$.next(false);
  }
}
