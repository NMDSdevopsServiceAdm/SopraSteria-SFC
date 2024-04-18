import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { DeleteWorkplaceDialogComponent } from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss'],
})
export class NewDashboardHeaderComponent implements OnInit, OnChanges {
  private subscriptions: Subscription = new Subscription();
  @Input() tab: string;
  @Input() canAddWorker = false;
  @Input() updatedDate: string;
  @Input() tAndQCount = 0;
  @Input() canEditWorker = false;
  @Input() hasWorkers = false;
  @Input() workplace: Establishment;

  public canDeleteEstablishment: boolean;
  public workplaceUid: string;
  public subsidiaryCount: number;
  public showLastUpdatedDate: boolean;
  public tabsMap = {
    workplace: 'Workplace',
    'staff-records': 'Staff records',
    'training-and-qualifications': 'Training and qualifications',
    benchmarks: 'Benchmarks',
    'workplace-users': 'Workplace users',
  };
  public header: string;
  public isParent: boolean;
  public isParentSubsidiaryView: boolean;
  public user: UserDetails;

  constructor(
    private establishmentService: EstablishmentService,
    private dialogService: DialogService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private userService: UserService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.isParent = this.workplace.isParent;

    this.setIsParentSubsidiaryView();

    if (this.workplace) {
      this.setSubsidiaryCount();
    }

    this.getPermissions();

    this.getHeader();
  }

  ngOnChanges(): void {
    this.setIsParentSubsidiaryView();
    this.setSubsidiaryCount();
    this.getPermissions();
    this.getHeader();
  }

  public setIsParentSubsidiaryView(): void {
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();

    if (!this.canDeleteEstablishment) {
      return;
    }

    this.dialogService
      .open(DeleteWorkplaceDialogComponent, { workplaceName: this.workplace.name })
      .afterClosed.subscribe((deleteConfirmed) => {
        if (deleteConfirmed) {
          this.deleteWorkplace();
        }
      });
  }

  private deleteWorkplace(): void {
    if (!this.canDeleteEstablishment) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.deleteWorkplace(this.workplace.uid).subscribe(
        () => {
          if (this.isParentSubsidiaryView) {
            this.establishmentService.getEstablishment(this.workplace.parentUid).subscribe((workplace) => {
              this.establishmentService.setPrimaryWorkplace(workplace);
              this.parentSubsidiaryViewService.clearViewingSubAsParent();

              this.router.navigate(['workplace', 'view-all-workplaces']).then(() => {
                this.displaySuccessfullyDeletedAlert();
              });
            });
          } else {
            this.router.navigate(['sfcadmin', 'search', 'workplace']).then(() => {
              this.displaySuccessfullyDeletedAlert();
            });
          }
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the workplace.',
          });
        },
      ),
    );
  }

  private displaySuccessfullyDeletedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `${this.workplace.name} has been permanently deleted.`,
    });
  }

  private getPermissions(): void {
    this.user = this.userService.loggedInUser;
    if (isAdminRole(this.user?.role)) {
      this.canDeleteEstablishment = this.permissionsService.can(
        this.establishmentService.primaryWorkplace?.uid,
        'canDeleteAllEstablishments',
      );
    } else {
      this.canDeleteEstablishment = this.permissionsService.can(
        this.establishmentService.primaryWorkplace?.uid,
        'canDeleteEstablishment',
      );
    }
  }

  private setSubsidiaryCount(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe((res) => {
        this.subsidiaryCount = res.subsidaries ? res.subsidaries.count : 0;
      }),
    );
  }

  private getHeader(): void {
    if (this.tab === 'training-and-qualifications') {
      this.header = `${this.tabsMap[this.tab]} (${this.tAndQCount})`;
    } else {
      this.header = this.tabsMap[this.tab];
    }
  }

  public navigateToDeleteWorkplace(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/delete-workplace', this.workplace.uid]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
