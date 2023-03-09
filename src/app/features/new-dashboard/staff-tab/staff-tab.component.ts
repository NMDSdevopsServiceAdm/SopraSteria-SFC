import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-new-staff-tab',
  templateUrl: './staff-tab.component.html',
})
export class NewStaffTabComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() workerCount: number;

  constructor(private workerService: WorkerService) {}

  ngOnInit(): void {
    this.workerService.setAddStaffRecordInProgress(false);
    this.workers = null;
    this.workerCount = 0;
  }
}
