import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { CancelDataOwnerDialogComponent } from '@shared/components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { ChangeDataOwnerDialogComponent } from '@shared/components/change-data-owner-dialog/change-data-owner-dialog.component';
import { SetDataPermissionDialogComponent } from '@shared/components/set-data-permission/set-data-permission-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
})
export class WorkplaceInfoPanelComponent implements OnInit, OnDestroy {
  @Output() public changeOwnershipAndPermissionsEvent = new EventEmitter();
  @Input() public workplace: Workplace;
  public canViewEstablishment: boolean;
  public canChangePermissionsForSubsidiary: boolean;
  public primaryWorkplace: Establishment;
  public dataOwner = WorkplaceDataOwner;
  public loggedInUser: string;
  private subscriptions: Subscription = new Subscription();
  public ownershipChangeRequestId: any = [];
  public ownershipChangeRequestCreatedByLoggegInUser: boolean;
  public ownershipChangeRequester: any;

  constructor(
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.subscriptions.add(
      this.permissionsService.hasWorkplacePermissions(this.workplace.uid).subscribe(hasPermissions => {
        if (hasPermissions) {
          this.canViewEstablishment = this.permissionsService.can(this.workplace.uid, 'canViewEstablishment');
          this.canChangePermissionsForSubsidiary = this.permissionsService.can(
            this.workplace.uid,
            'canChangePermissionsForSubsidiary'
          );
        }
      })
    );
  }

  private changeOwnershipAndPermissions(): void {
    this.changeOwnershipAndPermissionsEvent.emit(true);
  }

  public onChangeDataOwner($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(ChangeDataOwnerDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(changeDataOwnerConfirmed => {
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
        data => {
          if (data && data.length > 0) {
            this.userService.loggedInUser$.subscribe(user => {
              if (user) {
                this.loggedInUser = user.uid;
              }
            });
            data.forEach(element => {
              this.ownershipChangeRequestId.push(element.ownerChangeRequestUID);
              this.ownershipChangeRequester.push(element.createdByUserUID);
            });
            this.ownershipChangeRequester.forEach(requester => {
              this.ownershipChangeRequestCreatedByLoggegInUser = requester === this.loggedInUser ? true : false;
            });
            this.workplace.ownershipChangeRequestId = this.ownershipChangeRequestId;
            if (this.ownershipChangeRequestCreatedByLoggegInUser) {
              const dialog = this.dialogService.open(CancelDataOwnerDialogComponent, this.workplace);
              dialog.afterClosed.subscribe(cancelDataOwnerConfirmed => {
                if (cancelDataOwnerConfirmed) {
                  this.changeOwnershipAndPermissions();
                  this.router.navigate(['/dashboard']);
                  this.alertService.addAlert({
                    type: 'success',
                    message: 'Request to change data owner has been cancelled ',
                  });
                }
              });
            } else {
              this.router.navigate(['/notifications']);
            }
          }
        },
        error => {
          console.error(error.error.message);
        }
      )
    );
  }

  public setDataPermissions($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(SetDataPermissionDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(setPermissionConfirmed => {
      if (setPermissionConfirmed) {
        this.router.navigate(['/workplace/view-all-workplaces']);
        this.alertService.addAlert({
          type: 'success',
          message: `Data permissions for ${this.workplace.name} have been set.`,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
