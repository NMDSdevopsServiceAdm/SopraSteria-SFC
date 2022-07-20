import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private history: string[] = [];
  private readonly _back$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly back$: Observable<boolean> = this._back$.asObservable();

  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  public goBack(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  public set back(back: boolean) {
    this._back$.next(back);
  }
}
