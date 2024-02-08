import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GrantLetter } from '@core/model/wdf-claims/wdf-grant-letter.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GrantLetterService {
  constructor(private http: HttpClient) {}

  public sendEmailGrantLetter(establishmentId: string, grantLetter: string): Observable<GrantLetter> {
    return this.http.post<GrantLetter>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/wdfClaims/grantLetter`, grantLetter);
  }
}
