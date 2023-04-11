import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private benchmarksService: BenchmarksService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.authService.isOnAdminScreen = false;
    this.benchmarkDataSubscription();
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

  private benchmarkDataSubscription(): void {
    this.subscriptions.add(
      this.benchmarksService
        .getTileData(this.workplace.uid, ['sickness', 'turnover', 'pay', 'qualifications'])
        .subscribe((data) => {
          if (data) {
            this.tilesData = data;
          }
        }),
    );
  }

  private getStaffLastUpdatedDate(): void {
    const lastUpdatedDates = this.workers.map((worker) => new Date(worker.updated).getTime());
    this.staffLastUpdatedDate = new Date(Math.max(...lastUpdatedDates)).toISOString();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
