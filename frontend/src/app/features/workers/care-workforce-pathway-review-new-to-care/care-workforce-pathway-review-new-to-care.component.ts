import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';

import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService, CWPGetAllWorkersResponse } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-care-workforce-pathway-new-to-care',
  templateUrl: './care-workforce-pathway-review-new-to-care.component.html',
  standalone: false,
})
export class CareWorkforcePathwayNewToCareComponent implements OnInit {
  private workplaceUid: string;

  public workersToShow: CWPGetAllWorkersResponse['workers'] = [];

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.handleGetWorkersResponse(this.route.snapshot.data.workersWhoRequireCWPAnswer);
  }

  formatMainStartDate(date: string | null) {
    return date ? dayjs(date).format('D MMM YYYY') : '';
  }

  private handleGetWorkersResponse(response: CWPGetAllWorkersResponse): void {
    this.workersToShow = this.careWorkforcePathwayService.getWorkersWhoMeetNewToCareCriteria(response?.workers ?? []);
  }

  public setReturnToThisPage(): void {
    const urlOfThisPage = this.router.url;
    this.workerService.setReturnTo({ url: [urlOfThisPage] });
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Care Workforce Pathway role categories reviewed',
      });
    });
  }
}
