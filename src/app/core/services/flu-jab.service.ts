import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FluJabResponse {
  id: number;
  uid: string;
  name: string;
  fluJab: string;
}

@Injectable({
  providedIn: 'root',
})
export class FluJabService {
  constructor(private http: HttpClient) {}

  public getFluJabsByWorkplace(establishmentId): Observable<Array<FluJabResponse>> {
    return this.http.get<Array<FluJabResponse>>(`/api/establishment/${establishmentId}/fluJab`);
  }
}
