import { Component, OnInit } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public workers: Worker[];
  private subscriptions = [];

  constructor(private workerService: WorkerService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.workerService.getAllWorkers().subscribe(data => {
        console.log(data);
        this.workers = data;
      })
    );
  }
}
