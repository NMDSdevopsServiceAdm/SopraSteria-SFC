import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TravelTimePayService {
  constructor(private http: HttpClient) {}

  getAllTravelTimePayOptions(): Observable<any> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/travelTimePayOptions`)
      .pipe(map((res) => res.travelTimePayOptions));
  }
}
