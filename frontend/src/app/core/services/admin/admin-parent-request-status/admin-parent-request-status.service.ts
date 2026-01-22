import { Injectable } from '@angular/core';
import { ParentRequests } from '@core/model/parent-requests.model';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParentRequestsStateService {
  private readonly parentRequests$ = new BehaviorSubject<ParentRequests[] | null>(null);

  set(data: any[]): void {
    this.parentRequests$.next(data);
  }

  get$(): Observable<any[] | null> {
    return this.parentRequests$.asObservable();
  }

  clear(): void {
    this.parentRequests$.next(null);
  }
}
