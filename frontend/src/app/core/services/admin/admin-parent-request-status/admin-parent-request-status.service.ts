import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParentRequestsStateService {
  private readonly STORAGE_KEY = 'parentRequests';

  private readonly parentRequests$ = new BehaviorSubject<any[] | null>(null);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.parentRequests$.next(JSON.parse(stored));
    }
  }

  set(data: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.parentRequests$.next(data);
  }

  get$(): Observable<any[] | null> {
    return this.parentRequests$.asObservable();
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.parentRequests$.next(null);
  }
}
