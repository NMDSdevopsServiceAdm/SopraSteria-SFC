import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-basic-records-save-success',
  templateUrl: './basic-records-save-success.component.html',
  styleUrls: ['./basic-records-save-success.component.scss'],
})
export class BasicRecordsSaveSuccessComponent implements OnInit {
  public total: number;
  public return: { url: any[] };

  constructor(private route: ActivatedRoute, private router: Router, private workerService: WorkerService) {}

  ngOnInit() {
    this.total = this.workerService.getCreateStaffResponse();

    this.return.url =
      this.route.snapshot.data.establishment.uid === this.route.snapshot.data.primaryWorkplace.uid
        ? ['/dashboard']
        : ['/workplace', this.route.snapshot.data.establishment.uid];

    if (this.total === 0) {
      this.router.navigate(this.return.url, { fragment: 'staff-records', replaceUrl: true });
    }
  }
}
