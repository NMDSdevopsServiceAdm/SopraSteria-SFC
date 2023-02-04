import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private _backLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public backLink$: Observable<boolean> = this._backLink$.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.urlAfterRedirects.includes('#' && 'error')) {
          this.removeBackLink();
        }
      }
    });
  }

  private set backLink(show: boolean) {
    this._backLink$.next(show);
  }

  private get backLink(): boolean {
    console.log('*** get backlink ***');
    return this._backLink$.value;
  }

  public isBackLinkVisible(): boolean {
    return this.backLink;
  }

  public showBackLink(): void {
    this.backLink = true;
  }

  private removeBackLink(): void {
    this.backLink = false;
  }
}
