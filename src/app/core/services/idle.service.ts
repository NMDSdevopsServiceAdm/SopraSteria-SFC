import { Injectable } from '@angular/core';
import { fromEvent, interval, merge, Observable, Subject, Subscription } from 'rxjs';
import { bufferTime, filter, map, takeWhile, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  public ping$: Observable<any>;
  public timeout$ = new Subject<boolean>();

  private activity$: Observable<any>;
  private timer$: Observable<any>;
  private activitySubscription: Subscription;
  private timerSubscription: Subscription;
  private isTimeout = false;
  private ping = false;
  private lastActivity: number;
  private idlePeriod = 1800;
  private pingInterval = 240;

  constructor() {
    this.activity$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'touchend'),
    ).pipe(
      bufferTime(1000),
      filter((arr) => !!arr.length),
      tap(() => (this.lastActivity = Date.now())),
    );
  }

  public get isRunning(): boolean {
    return !!this.timerSubscription;
  }

  start() {
    this.setupTimer(this.idlePeriod);
    this.setupPing(this.pingInterval);

    this.isTimeout = false;
    this.ping = true;
    this.lastActivity = Date.now();

    this.activitySubscription = this.activity$.subscribe();
    this.timerSubscription = this.timer$.subscribe();
  }

  onTimeout(): Observable<boolean> {
    return this.timeout$.pipe(
      filter((timeout) => !!timeout),
      tap(() => (this.isTimeout = true)),
      map(() => true),
    );
  }

  clear() {
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.ping = false;
    this.lastActivity = null;
  }

  private setupTimer(idlePeriod: number) {
    this.timer$ = interval(1000).pipe(
      takeWhile(() => !this.isTimeout),
      tap(() => {
        const now = Date.now();
        const timeleft = this.lastActivity + idlePeriod * 1000;

        if (timeleft - now < 0) {
          this.timeout$.next(true);
        }
      }),
    );
  }

  private setupPing(pingInterval: number) {
    this.ping$ = interval(pingInterval * 1000).pipe(takeWhile(() => !this.isTimeout && this.ping));
  }
}
