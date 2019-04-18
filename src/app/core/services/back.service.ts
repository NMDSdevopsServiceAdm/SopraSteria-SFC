import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BackService {
  private readonly _back$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public readonly back$: Observable<URLStructure> = this._back$.asObservable();

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this._back$.value),
        filter(val => !!val)
      )
      .subscribe(() => {
        this._back$.next(null);
      });
  }

  private set back(back: URLStructure) {
    this._back$.next(back);
  }

  setBackLink(back: URLStructure) {
    this.back = back;
  }
}
