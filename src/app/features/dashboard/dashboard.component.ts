import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
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
  public canViewBenchmarks: boolean;
  public workplaceUid: string | null;
  public showSecondUserBanner: boolean;
  public canAddUser: boolean;
  public showCQCDetailsBanner = false;
  public workers: Worker[];
  public workerCount: number;
  public showSharingPermissionsBanner: boolean;

  constructor(
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.authService.isOnAdminScreen = false;
    this.showCQCDetailsBanner = this.establishmentService.checkCQCDetailsBanner;
    this.showSharingPermissionsBanner = this.establishmentService.checkSharingPermissionsBanner;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.workplace ? this.workplace.uid : null;

    if (this.workplace) {
      this.getPermissions();
      this.getCanViewBenchmarks();
      this.getTotalStaffRecords();

      if (this.workplace.locationId) {
        this.setCheckCQCDetailsBannerInEstablishmentService();
      }

      this.getShowCQCDetailsBanner();
      this.getShowSharingPermissionBanner();

      if (this.canViewListOfWorkers) {
        this.setWorkersAndTrainingAlert();
      }

      this.setShowSecondUserBanner();
    }

    this.setUserServiceReturnUrl();
  }

  private getPermissions(): void {
    this.canViewBenchmarks = this.permissionsService.can(this.workplaceUid, 'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(this.workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplaceUid, 'canViewEstablishment');
    this.canAddUser = this.permissionsService.can(this.workplaceUid, 'canAddUser');
  }

  private getCanViewBenchmarks(): void {
    this.subscriptions.add(
      this.permissionsService.getPermissions(this.workplaceUid).subscribe((permission) => {
        this.canViewBenchmarks = permission.permissions.canViewBenchmarks;
      }),
    );
  }

  private getTotalStaffRecords(): void {
    this.subscriptions.add(
      this.workerService.getTotalStaffRecords(this.workplace.uid).subscribe(
        (total) => {
          if (total) {
            this.totalStaffRecords = total;
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private setWorkersAndTrainingAlert(): void {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe(
        (workers) => {
          this.workers = workers;
          this.workerCount = workers.length;
          this.workerService.setWorkers(workers);
          if (workers.length > 0) {
            this.trainingAlert = workers[0].trainingAlert;
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private setShowSecondUserBanner(): void {
    this.subscriptions.add(
      this.userService.getAllUsersForEstablishment(this.workplaceUid).subscribe((users) => {
        this.showSecondUserBanner = this.canAddUser && users.length === 1;
      }),
    );
  }

  private setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'users',
    });
  }

  private setCheckCQCDetailsBannerInEstablishmentService(): void {
    this.subscriptions.add(
      this.establishmentService
        .getCQCRegistrationStatus(this.workplace.locationId, {
          postcode: this.workplace.postcode,
          mainService: this.workplace.mainService.name,
        })
        .subscribe((response) => {
          this.establishmentService.setCheckCQCDetailsBanner(response.cqcStatusMatch === false);
        }),
    );
  }

  private getShowCQCDetailsBanner(): void {
    this.subscriptions.add(
      this.establishmentService.checkCQCDetailsBanner$.subscribe((showBanner) => {
        this.showCQCDetailsBanner = showBanner;
      }),
    );
  }

  private getShowSharingPermissionBanner(): void {
    this.subscriptions.add(
      this.establishmentService.checkSharingPermissionsBanner$.subscribe((showBanner) => {
        this.showSharingPermissionsBanner = showBanner;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
