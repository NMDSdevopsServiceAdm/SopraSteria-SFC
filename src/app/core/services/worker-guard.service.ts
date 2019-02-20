import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { WorkerService } from './worker.service';

@Injectable({
  providedIn: 'root',
})
export class WorkerGuard implements CanActivateChild {
  constructor(private router: Router, private workerService: WorkerService) {}

  canActivateChild(): Observable<boolean> {
    const workerId = this.workerService.workerId;

    if (!workerId) {
      return this.denyAccess();
    }

    return this.workerService.getWorker(workerId).pipe(
      take(1),
      map(worker => true),
      catchError(error => {
        return this.denyAccess();
      })
    );
  }

  denyAccess() {
    this.router.navigate(['welcome']);
    return of(false);
  }
}
