import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-create-staff-record-start-screen',
  templateUrl: './create-staff-record-start-screen.component.html',
})
export class CreateStaffRecordStartScreenComponent implements OnInit {
  constructor(private route: ActivatedRoute, private workerService: WorkerService, private backService: BackService) {}

  ngOnInit() {
    const url =
      this.route.snapshot.data.primaryWorkplace &&
      this.route.snapshot.data.establishment.uid === this.route.snapshot.data.primaryWorkplace.uid
        ? ['/dashboard']
        : ['/workplace', this.route.snapshot.data.establishment.uid];

    this.backService.setBackLink({ url, fragment: 'staff-records' });
  }

  public beginAddStaffRecord(): void {
    this.workerService.addStaffRecordInProgress$.next(true);
  }
}
