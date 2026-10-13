import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BackLinkService } from '@core/services/backLink.service';
import { CWPGetAllWorkersResponse } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-care-workforce-pathway-new-to-care',
  templateUrl: './care-workforce-pathway-review-new-to-care.component.html',
  standalone: false,
})
export class CareWorkforcePathwayNewToCareComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private workplaceUid: string;

  public workersToShow: CWPGetAllWorkersResponse['workers'] = [];
  public workerCount: number;

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,

    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.handleGetWorkersResponse(this.route.snapshot.data.workersWhoRequireCWPAnswer);
  }

  // private getWorkers(): void {
  //   const queryParams = this.paginationSettings();

  //   this.subscriptions.add(
  //     this.careWorkforcePathwayService
  //       .getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(this.workplaceUid, queryParams)
  //       .pipe(take(1))
  //       .subscribe((response) => this.handleGetWorkersResponse(response)),
  //   );
  // }

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
