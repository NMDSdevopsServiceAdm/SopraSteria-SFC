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
  private readonly _backLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly back$: Observable<URLStructure> = this._back$.asObservable();
  public readonly backLink$: Observable<boolean> = this._backLink$.asObservable();

  constructor(private router: Router) {
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

  public setBackLink(back: URLStructure): void {
    this.back = back;
  }

  private set backLink(show: boolean) {
    this._backLink$.next(show);
  }

  public showBackLink(): void {
    this.backLink = true;
  }
}
