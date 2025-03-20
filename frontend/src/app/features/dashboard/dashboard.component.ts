import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public totalStaffRecords: number;
  public workplace: Establishment;
  public trainingAlert: number;
  public workplaceUid: string | null;
  public showSecondUserBanner: boolean;
  public canAddUser: boolean;
  public showCQCDetailsBanner = false;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public workerCount: number;
  public showSharingPermissionsBanner: boolean;
  private showBanner = false;
  public wdfNewDesignFlag: boolean;
  public tAndQsLastUpdated: string;
  public newDataAreaFlag: boolean;
  public canSeeNewDataArea: boolean;

  constructor(
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private benchmarksService: BenchmarksServiceBase,
    private userService: UserService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.showBanner = history.state?.showBanner;
    this.authService.isOnAdminScreen = false;
    this.showCQCDetailsBanner = this.establishmentService.checkCQCDetailsBanner;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.showSharingPermissionsBanner = this.workplace.showSharingPermissionsBanner;
    this.workplaceUid = this.workplace ? this.workplace.uid : null;
    this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;
    this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);

    if (this.workplace) {
      this.getPermissions();
      this.totalStaffRecords = this.route.snapshot.data.totalStaffRecords;

      if (this.canViewListOfWorkers) {
        this.setWorkersAndTrainingAlert();
      }
      this.setShowSecondUserBanner();
      this.getEstablishmentUsers();
    }

    this.showBanner && this.showStaffRecordBanner();
    this.wdfNewDesignFlag = await this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false);
    this.workerService.setState(null);
  }

  private getPermissions(): void {
    this.canViewListOfUsers = this.permissionsService.can(this.workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplaceUid, 'canViewEstablishment');
    this.canAddUser = this.permissionsService.can(this.workplaceUid, 'canAddUser');
  }

  private setWorkersAndTrainingAlert(): void {
    const { workers = [], workerCount = 0, trainingCounts, tAndQsLastUpdated } = this.route.snapshot.data.workers;
    this.workers = workers;
    this.workerCount = workerCount;
    this.trainingCounts = trainingCounts;
    this.workerService.setWorkers(workers);
    if (workers.length > 0) {
      this.trainingAlert = workers[0].trainingAlert;
    }
    this.tAndQsLastUpdated = tAndQsLastUpdated;
  }

  private setShowSecondUserBanner(): void {
    const users = this.route.snapshot.data.users ? this.route.snapshot.data.users : [];
    this.showSecondUserBanner = this.canAddUser && users.length === 1;
  }

  private getEstablishmentUsers(): void {
    this.userService.getAllUsersForEstablishment(this.workplaceUid).subscribe((users) => {
      this.userService.updateUsers(users);
    });
  }

  private showStaffRecordBanner(): void {
    this.alertService.addAlert({
      type: 'success',
      message: 'Staff record saved',
    });
  }

  public tabClickEvent($event) {
    if ($event.tabSlug === 'benchmarks') {
      this.subscriptions.add(this.benchmarksService.postBenchmarkTabUsage(this.workplace.id).subscribe());
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
