import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TravelTimePayService } from '@core/services/travel-time-pay.service';

@Injectable()
export class TravelTimePayResolver {
  constructor(private travelTimePayService: TravelTimePayService) {}
  resolve(): Observable<any> {
    return this.travelTimePayService.getAllTravelTimePayOptions().pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
