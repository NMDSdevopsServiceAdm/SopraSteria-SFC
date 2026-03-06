import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TravelTimePayOptions, TravelTimePayResponse } from '@core/model/travel-time-pay.model';

@Injectable({
  providedIn: 'root',
})
export class TravelTimePayService {
  constructor(private http: HttpClient) {}

  getAllTravelTimePayOptions(): Observable<TravelTimePayOptions[]> {
    return this.http
      .get<TravelTimePayResponse>(`${environment.appRunnerEndpoint}/api/travelTimePayOptions`)
      .pipe(map((res) => res.travelTimePayOptions));
  }
}
