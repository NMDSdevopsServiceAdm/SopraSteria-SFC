import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
  styleUrls: ['./home-tab.component.scss'],
})
export class HomeTabComponent implements OnInit {
  public updateWorkplace: boolean;
  public updateStaffRecords: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService, private workerService: WorkerService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService
        .getAllWorkers()
        .pipe(take(1))
        .subscribe(workers => {
          this.updateStaffRecords = !(workers.length > 0);
        })
    );

    this.subscriptions.add(
      this.establishmentService
        .getEmployerType()
        .pipe(take(1))
        .subscribe(d => {
          this.updateWorkplace = !d.employerType;
        })
    );
  }
}
