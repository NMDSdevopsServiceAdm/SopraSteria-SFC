import { Injectable } from '@angular/core';
import { CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CqcStatusChangeStateService {
  private readonly state$ = new BehaviorSubject<CqcStatusChanges[] | null>(null);

  set(data: any[]): void {
    this.state$.next(data);
  }

  get$(): Observable<any[] | null> {
    return this.state$.asObservable();
  }

  clear(): void {
    this.state$.next(null);
  }
}
