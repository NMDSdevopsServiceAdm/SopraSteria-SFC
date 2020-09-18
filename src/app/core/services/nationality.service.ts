import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Nationality, NationalityResponse } from '@core/model/nationality.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NationalityService {
  constructor(private http: HttpClient) {}

  getNationalities(): Observable<Nationality[]> {
    return this.http.get<NationalityResponse>('/api/nationality').pipe(map((res) => res.nationalities));
  }
}
