import { Component, OnDestroy, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  public fullname: string;
  public updateWorkplace: boolean;
  public updateStaffRecords: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService
        .getAllWorkers()
        .pipe(take(1))
        .subscribe(workers => {
          this.updateStaffRecords = workers.length > 0;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  hasFullname() {
    return (this.fullname = this.authService.fullname.split(' ')[0]);
  }

  signOut(event) {
    event.preventDefault();
    this.authService.logout();
  }
}
