import { Component, OnDestroy, OnInit } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth-service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public establishmentName: string;
  public fullname: string;
  public workers: Worker[];
  private subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService, private workerService: WorkerService) {}

  get isFirstLoggedIn(): boolean {
    return this.authService.isFirstLogin == null ? false : this.authService.isFirstLogin;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.getAllWorkers().subscribe(data => {
        this.workers = data;
      })
    );

    this.establishmentName = this.authService.establishment.name;
    this.fullname = this.authService.fullname;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
