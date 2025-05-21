import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobRole } from '@core/model/job.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-care-workforce-pathway-workers-summary',
  templateUrl: './care-workforce-pathway-workers-summary.component.html',
})
export class CareWorkforcePathwayWorkersSummaryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public workersToShow: Array<{ uid: string; nameOrId: string; mainJob: JobRole }> = [];

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.getWorkers();
  }

  private getWorkers(): void {
    const workplaceUid = this.establishmentService.establishment.uid;

    this.subscriptions.add(
      this.careWorkforcePathwayService
        .getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(workplaceUid)
        .subscribe((response) => {
          if (response?.workers?.length) {
            this.workersToShow = response.workers;
          }
        }),
    );
  }

  public setReturnToThisPage(): void {
    const urlOfThisPage = this.router.url;
    this.workerService.setReturnTo({ url: [urlOfThisPage] });
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
