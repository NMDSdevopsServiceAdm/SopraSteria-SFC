import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { WindowRef } from './window.ref';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private _alert$: BehaviorSubject<Alert> = new BehaviorSubject(null);
  private _eventIdsToWatchFor: Set<number> = new Set();

  constructor(private router: Router, private windowRef: WindowRef) {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      this.registerAlertRemovalOnNavigationEnd(event.id);
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.checkEventForAlertRemoval(event.id);
    });
  }

  public get alert$(): Observable<Alert> {
    return this._alert$.asObservable();
  }

  addAlert(alert: Alert) {
    this._alert$.next(alert);
    this.windowRef.nativeWindow.scrollTo(0, 0);
    this._eventIdsToWatchFor.clear();
  }

  removeAlert() {
    this._alert$.next(null);
  }

  public get hasAlert(): boolean {
    return this._alert$.value !== null;
  }

  public get currentAlert(): Alert {
    return this._alert$.value;
  }

  private registerAlertRemovalOnNavigationEnd(eventId: number): void {
    if (this.hasAlert) {
      this._eventIdsToWatchFor.add(eventId);
    }
  }

  private checkEventForAlertRemoval(eventId: number): void {
    if (!this.hasAlert || this._eventIdsToWatchFor.size === 0) {
      return;
    }

    if (this._eventIdsToWatchFor.has(eventId)) {
      this.removeAlert();
      this._eventIdsToWatchFor.clear();
    }
  }
}
