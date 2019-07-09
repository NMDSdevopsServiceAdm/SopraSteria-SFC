import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { parse } from 'url';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _display$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public readonly display$: Observable<boolean> = this._display$.asObservable();

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => parse(this.router.url).pathname),
        distinctUntilChanged(),
        map(() => this._display$.value),
        filter(val => !!val)
      )
      .subscribe(() => {
        this._display$.next(null);
      });
  }

  public show() {
    this._display$.next(true);
  }
}
