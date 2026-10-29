import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import {
  CareWorkforcePathwayService,
  CWPGetWorkersWhoMeetNewToCareCriteriaResponse,
} from '@core/services/care-workforce-pathway.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-care-workforce-pathway-new-to-care',
  templateUrl: './care-workforce-pathway-review-new-to-care.component.html',
  standalone: false,
})
export class CareWorkforcePathwayNewToCareComponent implements OnInit {
  public workersToShow: CWPGetWorkersWhoMeetNewToCareCriteriaResponse['workers'] = [];

  constructor(
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workersToShow = this.route.snapshot.data?.workersWhoMeetNewToCareCriteria;

    if (!this.workersToShow?.length) {
      this.returnToStartingPoint(true);
    }
  }

  public setReturnToThisPage(): void {
    const urlOfThisPage = this.router.url;
    this.workerService.setReturnTo({ url: [urlOfThisPage] });
  }

  public returnToStartingPoint(redirectOnPageLoad: boolean = false): void {
    const startPointTab = this.careWorkforcePathwayService.workerSummaryJourneyStartingPoint;
    const navigationExtras = { fragment: startPointTab } as NavigationExtras;
    if (redirectOnPageLoad) {
      navigationExtras.replaceUrl = true;
    }

    this.router.navigate(['/dashboard'], navigationExtras).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Care Workforce Pathway role categories reviewed',
      });
    });
  }
}
