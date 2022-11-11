import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private readonly _backLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public readonly backLink$: Observable<boolean> = this._backLink$.asObservable();

  constructor(private router: Router) {
    // console.log('*******');
    // console.log(this.router.events.pipe());
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.removeBackLink();
    });
    // this.router.events.pipe(
    //   filter((event) => event instanceof NavigationEnd),
    //   map(() => {
    //     console.log(parse(this.router.url).pathname);
    //   }),
    // );
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
