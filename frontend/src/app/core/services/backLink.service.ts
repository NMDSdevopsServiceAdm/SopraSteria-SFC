import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { parseUrl } from '@core/utils/url-util';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private _backLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public backLink$: Observable<boolean> = this._backLink$.asObservable();

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => parseUrl(this.router.url).pathname),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.removeBackLink();
      });
  }

  private set backLink(show: boolean) {
    this._backLink$.next(show);
  }

  public showBackLink(): void {
    this.backLink = true;
  }

  private removeBackLink(): void {
    this.backLink = false;
  }
}
