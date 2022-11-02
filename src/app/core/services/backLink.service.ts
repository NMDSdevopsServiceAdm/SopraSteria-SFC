import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private readonly _backLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public readonly backLink$: Observable<boolean> = this._backLink$.asObservable();

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
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
