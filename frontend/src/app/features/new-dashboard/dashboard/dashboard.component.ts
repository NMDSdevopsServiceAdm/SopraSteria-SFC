import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BenchmarksResponse } from '@core/model/benchmarks-v2.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './dashboard.component.html',
})
export class NewDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public selectedTab: string;
  public workplace: Establishment;
  public workerCount: number;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public canViewListOfWorkers: boolean;
  public canViewEstablishment: boolean;
  public staffLastUpdatedDate: string;
  public tAndQsLastUpdated: string;
  public tilesData: BenchmarksResponse;
  public canSeeNewDataArea: boolean;
  public isParent: boolean;
  public isTrainingCourse: boolean;

  constructor(
    private route: ActivatedRoute,
    private tabsService: TabsService,
    protected benchmarksService: BenchmarksV2Service,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
    this.tilesData = this.benchmarksService.benchmarksData.newBenchmarks;
    this.isTrainingCourse = this.route.snapshot.data.trainingCourses?.length > 0;

    this.isParent = this.workplace?.isParent;

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
