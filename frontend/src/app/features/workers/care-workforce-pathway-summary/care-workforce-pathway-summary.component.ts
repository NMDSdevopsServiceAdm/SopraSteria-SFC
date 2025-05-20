import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobRole } from '@core/model/job.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-care-workforce-pathway-summary',
  templateUrl: './care-workforce-pathway-summary.component.html',
  styleUrl: './care-workforce-pathway-summary.component.scss',
})
export class CareWorkforcePathwaySummaryComponent implements OnInit {
  private workplaceUid: string;
  public workersToShow: Array<{ uid: string; nameOrId: string; mainJob: JobRole }> = [];

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private router: Router,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
  ) {}

  ngOnInit() {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.getWorkers();
  }

  private getWorkers() {
    this.careWorkforcePathwayService
      .getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(this.workplaceUid)
      .subscribe((response) => {
        if (response.workers?.length) {
          this.workersToShow = response.workers;
        }
      });
  }

  public setReturnToThisPage() {
    const urlOfThisPage = this.router.url;
    this.workerService.setReturnTo({ url: [urlOfThisPage] });
  }

  public returnToHome() {
    this.router.navigate(['/dashboard']);
  }
}
