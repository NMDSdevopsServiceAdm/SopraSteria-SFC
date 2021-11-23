import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  templateUrl: 'worker-save-success.component.html',
})
export class WorkerSaveSuccessComponent implements OnDestroy {
  public return: { url: any[]; fragment: string; label: string };

  constructor(private route: ActivatedRoute, private workerService: WorkerService) {
    const workplaceUid = this.route.snapshot.paramMap.get('establishmentuid');
    const primaryWorkplaceUid = this.route.parent.snapshot.data.primaryWorkplace
      ? this.route.parent.snapshot.data.primaryWorkplace.uid
      : null;

    this.return =
      workplaceUid === primaryWorkplaceUid
        ? { url: ['/dashboard'], fragment: 'home', label: 'home' }
        : { url: ['/workplace', workplaceUid], fragment: 'workplace', label: 'workplace' };
  }

  ngOnDestroy() {
    this.workerService.addStaffRecordInProgress$.next(false);
  }
}
