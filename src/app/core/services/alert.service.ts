import { Injectable } from '@angular/core';
import { Alert } from '@core/model/alert.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  public alert$: BehaviorSubject<Alert> = new BehaviorSubject(null);

  constructor() {}

  addAlert(alert: Alert) {
    this.alert$.next(alert);
  }

  removeAlert() {
    this.alert$.next(null);
  }
}
