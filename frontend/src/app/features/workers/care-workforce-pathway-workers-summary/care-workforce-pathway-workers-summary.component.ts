import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobRole } from '@core/model/job.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService, CWPGetAllWorkersResponse } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-care-workforce-pathway-workers-summary',
  templateUrl: './care-workforce-pathway-workers-summary.component.html',
})
export class CareWorkforcePathwayWorkersSummaryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private workplaceUid: string;
  public workersToShow: Array<{ uid: string; nameOrId: string; mainJob: JobRole }> = [];
  public workerCount: number;
  public itemsPerPage: number = 15;
  public pageIndex: number = 0;

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.handleGetWorkersResponse(this.route.snapshot.data.workersWhoRequireCWPAnswer);
  }

  private getWorkers(): void {
    const queryParams = { pageIndex: this.pageIndex, itemsPerPage: this.itemsPerPage };

    this.subscriptions.add(
      this.careWorkforcePathwayService
        .getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(this.workplaceUid, queryParams)
        .pipe(take(1))
        .subscribe((response) => this.handleGetWorkersResponse(response)),
    );
  }

  private handleGetWorkersResponse(response: CWPGetAllWorkersResponse): void {
    if (response?.workers?.length) {
      this.workersToShow = response.workers;
      this.workerCount = response?.workerCount;
    } else {
      this.returnToHome();
    }
  }

  public setReturnToThisPage(): void {
    const urlOfThisPage = this.router.url;
    this.workerService.setReturnTo({ url: [urlOfThisPage] });
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  public handlePageUpdate(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.getWorkers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
