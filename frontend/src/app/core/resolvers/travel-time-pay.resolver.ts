import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TravelTimePayService } from '@core/services/travel-time-pay.service';
import { TravelTimePayOptions } from '@core/model/travel-time-pay.model';

@Injectable()
export class TravelTimePayResolver {
  constructor(private travelTimePayService: TravelTimePayService) {}
  resolve(): Observable<TravelTimePayOptions[]> {
    return this.travelTimePayService.getAllTravelTimePayOptions().pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
