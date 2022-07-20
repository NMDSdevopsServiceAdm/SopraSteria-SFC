import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BackLinkService {
  private set back(): boolean {
    this._back$.next = true;
  }
}
