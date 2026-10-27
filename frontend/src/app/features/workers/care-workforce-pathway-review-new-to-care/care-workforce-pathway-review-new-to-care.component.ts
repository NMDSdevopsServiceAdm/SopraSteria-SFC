import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { CWPGetWorkersWhoMeetNewToCareCriteriaResponse } from '@core/services/care-workforce-pathway.service';
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
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workersToShow = this.route.snapshot.data?.workersWhoMeetNewToCareCriteria;
  }

  formatMainStartDate(date: string | null) {
    return date ? dayjs(date).format('D MMM YYYY') : '';
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
