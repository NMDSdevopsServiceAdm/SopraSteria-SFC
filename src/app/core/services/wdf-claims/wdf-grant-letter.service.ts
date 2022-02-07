import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GrantLetterService {
  constructor(private http: HttpClient) {}

  public sendEmailGrantLetter(establishmentId: string, grantLetter: string) {
    return this.http.post<any>(`/api/establishment/${establishmentId}/wdfClaims/grantLetter`, grantLetter);
  }
}
