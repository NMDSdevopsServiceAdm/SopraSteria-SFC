import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Nationality, NationalityResponse } from '@core/model/nationality.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NationalityService {
  constructor(private http: HttpClient) {}

  getNationalities(): Observable<Nationality[]> {
    return this.http.get<NationalityResponse>(`${environment.appRunnerEndpoint}/api/nationality`).pipe(map(res => res.nationalities));
  }
}
