import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { WORKPLACE_SUMMARY_ROUTE } from '@core/constants/constants';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { CancelDataOwnerDialogComponent } from '@shared/components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { ChangeDataOwnerDialogComponent } from '@shared/components/change-data-owner-dialog/change-data-owner-dialog.component';
import { MoveWorkplaceDialogComponent } from '@shared/components/move-workplace/move-workplace-dialog.component';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
  standalone: false,
})
export class WorkplaceInfoPanelComponent implements OnInit, OnDestroy {
  @Output() public changeOwnershipAndPermissionsEvent = new EventEmitter();
  @Input() public workplace: Workplace;
  @Input() public subWorkplaceNumber: number;
  public canViewEstablishment: boolean;
  public canChangePermissionsForSubsidiary: boolean;
  public primaryWorkplace: Establishment;
  public dataOwner = WorkplaceDataOwner;
  public loggedInUser: string;
  private subscriptions: Subscription = new Subscription();
  public ownershipChangeRequestId: any = [];
  public ownershipChangeRequestCreatedByLoggegInUser: boolean;
  public ownershipChangeRequester: any;
  public canEditParentEstablishment: boolean;

  constructor(
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private alertService: AlertService,
    private authService: AuthService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit() {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.subscriptions.add(
      this.permissionsService.hasWorkplacePermissions(this.workplace.uid).subscribe((hasPermissions) => {
        if (hasPermissions) {
          const canViewEstablishmentPermission = this.permissionsService.can(
            this.workplace.uid,
            'canViewEstablishment',
          );
          const canChangePermissionsForSubsidiaryPermission = this.permissionsService.can(
            this.workplace.uid,
            'canChangePermissionsForSubsidiary',
          );
          const canEditParentEstablishmentPermission = this.permissionsService.can(
            this.primaryWorkplace.uid,
            'canEditEstablishment',
          );
          this.setPermissions({
            canViewEstablishmentPermission,
            canChangePermissionsForSubsidiaryPermission,
            canEditParentEstablishmentPermission,
          });
        }
      }),
    );
  }

  private setPermissions(args: any): void {
    const {
      canViewEstablishmentPermission = false,
      canChangePermissionsForSubsidiaryPermission = false,
      canEditParentEstablishmentPermission = false,
    } = args;
    this.canViewEstablishment = canViewEstablishmentPermission;
    this.canChangePermissionsForSubsidiary = canChangePermissionsForSubsidiaryPermission;
    this.canEditParentEstablishment = canEditParentEstablishmentPermission;
  }

  private changeOwnershipAndPermissions(): void {
    this.changeOwnershipAndPermissionsEvent.emit(true);
  }

  public onChangeDataOwner($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(ChangeDataOwnerDialogComponent, this.workplace);
    dialog.afterClosed.subscribe((changeDataOwnerConfirmed) => {
      if (changeDataOwnerConfirmed) {
        this.changeOwnershipAndPermissions();
        this.router.navigate(['/dashboard']);
        this.alertService.addAlert({
          type: 'success',
          message: `Request to change data owner has been sent to ${this.workplace.name} `,
        });
      }
    });
  }

  public cancelChangeDataOwnerRequest($event: Event) {
    $event.preventDefault();
    this.ownershipChangeRequestId = [];
    this.ownershipChangeRequester = [];
    this.subscriptions.add(
      this.establishmentService.changeOwnershipDetails(this.workplace.uid).subscribe(
        (data) => {
          if (data && data.length > 0) {
            this.userService.loggedInUser$.subscribe((user) => {
              if (user) {
                this.loggedInUser = user.uid;
              }
            });
            data.forEach((element) => {
              this.ownershipChangeRequestId.push(element.ownerChangeRequestUID);
              this.ownershipChangeRequester.push(element.createdByUserUID);
            });
            this.ownershipChangeRequester.forEach((requester) => {
              this.ownershipChangeRequestCreatedByLoggegInUser = requester === this.loggedInUser ? true : false;
            });
            this.workplace.ownershipChangeRequestId = this.ownershipChangeRequestId;

            const dialog = this.dialogService.open(CancelDataOwnerDialogComponent, this.workplace);
            dialog.afterClosed.subscribe((cancelDataOwnerConfirmed) => {
              if (cancelDataOwnerConfirmed) {
                this.changeOwnershipAndPermissions();
                this.router.navigate(['/workplace/view-all-workplaces']);
                this.alertService.addAlert({
                  type: 'success',
                  message: 'Request to change data owner has been cancelled ',
                });
              }
            });
          }
        },
        (error) => {
          console.error(error.error.message);
        },
      ),
    );
  }

  public navigateToChangeDataOwner(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/workplace/change-data-owner'], {
      queryParams: { changeDataOwnerFrom: this.workplace.uid },
    });
  }

  public navigateToChangeDataPermissions(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/workplace/change-data-permissions'], {
      queryParams: { changeDataPermissionsFor: this.workplace.uid },
    });
  }

  public visitSubWorkplaceOrsetEmployerType(event: Event): void {
    event.preventDefault();

    this.establishmentService.getEstablishment(this.workplace.uid).subscribe((data) => {
      if (data.employerType == null) {
        this.establishmentService.setEmployerTypeHasValue(false);
        const typeOfEmployerPage = this.establishmentService.buildPathForWorkplaceSummary(
          this.workplace.uid,
          'type-of-employer',
        );
        return this.router.navigate(typeOfEmployerPage);
      } else {
        this.parentSubsidiaryViewService.setViewingSubAsParent(this.workplace.uid);
        this.router.navigate(['/subsidiary', this.workplace.uid, 'home']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  public isAdminUser(): boolean {
    return this.authService.isAdmin;
  }

  public moveWorkplaceAdmin($event: Event): void {
    $event.preventDefault();
    this.dialogService.open(MoveWorkplaceDialogComponent, this.workplace);
  }
}
