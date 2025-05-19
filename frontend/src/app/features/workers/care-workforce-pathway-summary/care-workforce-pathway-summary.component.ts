import { Component } from '@angular/core';
import { CareWorkforcePathwayService } from '../../../core/services/care-workforce-pathway.service';
import { BackLinkService } from '../../../core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobRole } from '@core/model/job.model';

@Component({
  selector: 'app-care-workforce-pathway-summary',
  templateUrl: './care-workforce-pathway-summary.component.html',
  styleUrl: './care-workforce-pathway-summary.component.scss',
})
export class CareWorkforcePathwaySummaryComponent {
  private workplaceUid: string;
  public workersToShow: Array<{ uid: string; nameOrId: string; mainJob: JobRole }>;

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
    this.workersToShow = [];
  }
}
