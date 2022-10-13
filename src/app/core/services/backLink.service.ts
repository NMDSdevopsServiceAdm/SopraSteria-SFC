import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private readonly _backLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public readonly backLink$: Observable<boolean> = this._backLink$.asObservable();

  private set backLink(show: boolean) {
    this._backLink$.next(show);
  }

  public showBackLink(): void {
    this.backLink = true;
  }
}
