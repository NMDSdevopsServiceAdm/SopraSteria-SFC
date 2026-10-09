import { Component, effect, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SortStaffOptionsForCWPWorkerSummary } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import {
  CareWorkforcePathwayService,
  CWPGetAllWorkersResponse,
  CWPWorkerSummaryPaginationSettings,
} from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

const defaultPaginationSettings: CWPWorkerSummaryPaginationSettings = {
  itemsPerPage: 15,
  pageIndex: 0,
  sortBy: Object.keys(SortStaffOptionsForCWPWorkerSummary)[0],
};

@Component({
  selector: 'app-care-workforce-pathway-workers-summary',
  templateUrl: './care-workforce-pathway-workers-summary.component.html',
  styleUrl: './care-workforce-pathway-workers-summary.component.scss',
  standalone: false,
})
export class CareWorkforcePathwayWorkersSummaryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private workplaceUid: string;

  public workersToShow: CWPGetAllWorkersResponse['workers'] = [];
  public workerCount: number;

  public paginationSettings = signal(defaultPaginationSettings);
  public sortByOptions: Record<string, string> = SortStaffOptionsForCWPWorkerSummary;

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private route: ActivatedRoute,
  ) {
    effect(() => {
      const paginationSettings = this.paginationSettings();
      this.getWorkers(paginationSettings);
    });
  }

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.handleGetWorkersResponse(this.route.snapshot.data.workersWhoRequireCWPAnswer);
    const previousPaginationSettings = this.careWorkforcePathwayService.workerSummaryPaginationSettings;

    if (previousPaginationSettings) {
      this.paginationSettings.set(previousPaginationSettings);
    }

    this.clearPaginationSettingsWhenClickedAway();
  }

  public get pageIndex() {
    return this.paginationSettings().pageIndex;
  }

  public get itemsPerPage() {
    return this.paginationSettings().itemsPerPage;
  }

  public get sortBy() {
    return this.paginationSettings().sortBy;
  }

  private getWorkers(queryParams: CWPWorkerSummaryPaginationSettings): void {
    this.subscriptions.add(
      this.careWorkforcePathwayService
        .getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(this.workplaceUid, queryParams)
        .pipe(take(1))
        .subscribe((response) => this.handleGetWorkersResponse(response)),
    );
  }

  private storePaginationSettingsInService(): void {
    const currentSettings = this.paginationSettings();
    this.careWorkforcePathwayService.workerSummaryPaginationSettings = currentSettings;
  }

  private handleGetWorkersResponse(response: CWPGetAllWorkersResponse): void {
    if (response?.workers?.length) {
      this.workersToShow = response.workers;
      this.workerCount = response?.workerCount;
    } else {
      this.returnToHome();
    }
  }

  public handleSortChange(sortBy: string): void {
    this.paginationSettings.update((prev) => ({ ...prev, sortBy, pageIndex: 0 }));
    this.storePaginationSettingsInService();
  }

  public handlePageUpdate(pageIndex: number): void {
    this.paginationSettings.update((prev) => ({ ...prev, pageIndex }));
    this.storePaginationSettingsInService();
  }

  public clearPaginationSettingsWhenClickedAway(): void {
    const urlOfThisPage = this.router?.url;
    const urlPatternOfWorkerQuestion = /staff-record-summary\/care-workforce-pathway$/;
    const hasClickedAway = (event: NavigationEnd) => {
      const newUrl = event.urlAfterRedirects;
      return newUrl !== urlOfThisPage && !urlPatternOfWorkerQuestion.test(newUrl);
    };

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter(hasClickedAway),
        take(1),
      )
      .subscribe(() => {
        this.careWorkforcePathwayService.workerSummaryPaginationSettings = null;
      });
  }

  public setReturnToThisPage(): void {
    const urlOfThisPage = this.router.url;
    this.workerService.setReturnTo({ url: [urlOfThisPage] });
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  public visitReviewNewToCarePage(): void {
    this.router.navigate(['./review-new-to-care'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
