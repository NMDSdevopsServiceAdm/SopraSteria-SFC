import { Injectable } from '@angular/core';
import { NavigationEnd, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface URLStructure {
  url: string[];
  fragment?: string;
  queryParams?: Params;
}

@Injectable({
  providedIn: 'root',
})
export class BackService {
  private _back$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public back$: Observable<URLStructure> = this._back$.asObservable();

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

  set back(back: URLStructure) {
    this._back$.next(back);
  }
}
