import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-basic-records-save-success',
  templateUrl: './basic-records-save-success.component.html',
  styleUrls: ['./basic-records-save-success.component.scss'],
})
export class BasicRecordsSaveSuccessComponent implements OnInit {
  public total: number;

  constructor(private router: Router, private workerService: WorkerService) {}

  ngOnInit() {
    this.total = this.workerService.getCreateStaffResponse();
    if (this.total === 0) {
      this.router.navigate(['/dashboard'], { fragment: 'staff-records', replaceUrl: true });
    }
  }
}
