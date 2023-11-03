import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, OnChanges, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './dashboard.component.html',
})
export class NewDashboardComponent implements OnInit, OnDestroy, OnChanges {
  private subscriptions: Subscription = new Subscription();
  public selectedTab: string;
  public primaryEstablishment: Establishment;
  public workplace: Establishment;
  public subWorkplace: Establishment;
  public workerCount: number;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public canViewListOfWorkers: boolean;
  public canViewEstablishment: boolean;
  public staffLastUpdatedDate: string;
  public tAndQsLastUpdated: string;
  public tilesData: BenchmarksResponse;
  public newDataAreaFlag: boolean;
  public canSeeNewDataArea: boolean;
  public isParent: boolean;
  @Input() isStandAloneAccount: boolean;
  @Input() isSubsAccount: boolean;
  public primaryWorkplaceName: string;
  public isSelectedWorkplace: boolean;

  constructor(
    private route: ActivatedRoute,
    private tabsService: TabsService,
    protected benchmarksService: BenchmarksService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  ngOnInit(): void {
    this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;

    this.isSelectedWorkplace = this.establishmentService.getIsSelectedWorkplace();
    this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    this.subWorkplace = this.establishmentService?.establishment;
    //this.setWorkplace();
    this.workplace = this.route.snapshot.data.establishment;
    this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
    this.tilesData = this.benchmarksService.benchmarksData;

    this.isParent = !this.isSelectedWorkplace && this.primaryEstablishment?.isParent;

    this.authService.isOnAdminScreen = false;
    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        this.selectedTab = selectedTab;
        this.cd.detectChanges();
      }),
    );

    if (this.workplace) {
      this.getPermissions();

      this.canViewListOfWorkers && this.setWorkersAndTrainingValues();
    }

    console.log(this.workplace);
  }

  @HostListener('document:click', ['$event.target.id']) onClick(target) {
    if (target === 'backToParentLink') {
      this.isSelectedWorkplace = false;
      this.workplace = this.route.snapshot.data.establishment;
      //this.setWorkplace();
      //this.workplace = this.primaryEstablishment;
      //this.isParent = !this.isSelectedWorkplace && this.primaryEstablishment?.isParent;
    }
  }

  ngOnChanges(): void {
    this.isSelectedWorkplace = this.establishmentService.getIsSelectedWorkplace();
    this.isParent = !this.isSelectedWorkplace && this.primaryEstablishment?.isParent;
    this.workplace = this.route.snapshot.data.establishment;
  }

  private setWorkplace(): void {
    this.workplace = this.isSelectedWorkplace ? this.subWorkplace : this.primaryEstablishment;
  }

  private getPermissions(): void {
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplace.uid, 'canViewEstablishment');
  }

  private setWorkersAndTrainingValues(): void {
    const { workers = [], workerCount = 0, trainingCounts, tAndQsLastUpdated } = this.route.snapshot.data.workers;
    this.workers = workers;
    this.workerCount = workerCount;
    this.trainingCounts = trainingCounts;
    this.tAndQsLastUpdated = tAndQsLastUpdated;
    workers.length > 0 && this.getStaffLastUpdatedDate();
  }

  private getStaffLastUpdatedDate(): void {
    const lastUpdatedDates = this.workers.map((worker) => new Date(worker.updated).getTime());
    this.staffLastUpdatedDate = new Date(Math.max(...lastUpdatedDates)).toISOString();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
