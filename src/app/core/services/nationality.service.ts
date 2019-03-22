import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NationalityResponse {
  id: number;
  nationality: string;
}

@Injectable({
  providedIn: 'root',
})
export class NationalityService {
  constructor(private http: HttpClient) {}

  getNationalities(): Observable<NationalityResponse[]> {
    return this.http.get<any>('/api/nationality').pipe(map(res => res.nationalities));
  }
}
