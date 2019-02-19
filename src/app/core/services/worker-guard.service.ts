import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { WorkerService } from './worker.service';
import { Worker } from '../../core/model/worker.model';

@Injectable({
  providedIn: 'root',
})
export class WorkerGuard implements CanActivateChild {
  worker: Worker;

  constructor(private router: Router, private _workerService: WorkerService) {}

  canActivateChild(): Observable<boolean> {
    this._workerService.worker$.subscribe(worker => this.worker = worker);

    //const workerId = this.workerService.workerId;
    const workerId = this._workerService.worker.uid;


    if (!workerId) {
      return this.denyAccess();
    }

    return this._workerService.getWorker(workerId).pipe(
      take(1),
      map(worker => true),
      catchError(error => {
        return this.denyAccess();
      }),
    );
  }

  denyAccess() {
    this.router.navigate(['welcome']);
    return of(false);
  }
}
