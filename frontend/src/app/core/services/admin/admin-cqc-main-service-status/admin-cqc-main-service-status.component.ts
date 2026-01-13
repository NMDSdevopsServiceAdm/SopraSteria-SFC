import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CqcStatusChangeStateService {
  private readonly STORAGE_KEY = 'cqcStatusChanges';

  private readonly state$ = new BehaviorSubject<any[] | null>(null);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.state$.next(JSON.parse(stored));
    }
  }

  set(data: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.state$.next(data);
  }

  get$(): Observable<any[] | null> {
    return this.state$.asObservable();
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state$.next(null);
  }
}
