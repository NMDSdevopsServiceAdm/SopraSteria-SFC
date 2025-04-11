import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { WindowRef } from './window.ref';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private _alert$: BehaviorSubject<Alert> = new BehaviorSubject(null);

  constructor(private router: Router, private windowRef: WindowRef) {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
      this.removeAlert();
    });
  }

  public get alert$(): Observable<Alert> {
    return this._alert$.asObservable();
  }

  addAlert(alert: Alert) {
    this._alert$.next(alert);
    this.windowRef.nativeWindow.scrollTo(0, 0);
  }

  removeAlert() {
    this._alert$.next(null);
  }
}
