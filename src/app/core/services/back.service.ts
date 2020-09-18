import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import * as parse from 'url-parse';

@Injectable({
  providedIn: 'root',
})
export class BackService {
  private readonly _back$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public readonly back$: Observable<URLStructure> = this._back$.asObservable();

  constructor(private router: Router, private location: Location) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => parse(this.router.url).pathname),
        distinctUntilChanged(),
        map(() => this._back$.value),
        filter((val) => !!val),
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
