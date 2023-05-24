import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AlertService } from '@core/services/alert.service';
import { DeleteWorkplaceDialogComponent } from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-new-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss'],
})
export class NewDashboardHeaderComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  @Input() tab: string;
  @Input() canAddWorker = false;
  @Input() updatedDate: string;
  @Input() tAndQCount = 0;
  @Input() canEditWorker = false;
  @Input() hasWorkers = false;

  public workplace: Establishment;
  public canDeleteEstablishment: boolean;
  public workplaceUid: string;
  public subsidiaryCount: number;
  public showLastUpdatedDate: boolean;
  public tabsMap = {
    workplace: 'Workplace',
    'staff-records': 'Staff records',
    'training-and-qualifications': 'Training and qualifications',
    benchmarks: 'Benchmarks',
  };
  public header: string;

  constructor(
    private establishmentService: EstablishmentService,
    private dialogService: DialogService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.workplace ? this.workplace.uid : null;
    this.getHeader();
    this.getPermissions();

    if (this.workplace) {
      this.setSubsidiaryCount();
    }
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
          this.permissionsService.clearPermissions();
          this.authService.restorePreviousToken();

          if (this.authService.getPreviousToken().EstablishmentUID) {
            this.establishmentService
              .getEstablishment(this.authService.getPreviousToken().EstablishmentUID)
              .pipe(take(1))
              .subscribe((workplace) => {
                this.establishmentService.setState(workplace);
                this.establishmentService.setPrimaryWorkplace(workplace);
                this.establishmentService.establishmentId = workplace.uid;
                this.router.navigate(['/search-establishments']).then(() => {
                  this.alertService.addAlert({
                    type: 'success',
                    message: `${this.workplace.name} has been permanently deleted.`,
                  });
                });
              });
          } else {
            this.router.navigate(['/search-establishments']).then(() => {
              this.alertService.addAlert({
                type: 'success',
                message: `${this.workplace.name} has been permanently deleted.`,
              });
            });
          }
        },
        (e) => {
          console.error(e);
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the workplace.',
          });
        },
      ),
    );
  }

  private getPermissions(): void {
    this.canDeleteEstablishment = this.permissionsService.can(this.workplaceUid, 'canDeleteAllEstablishments');
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
