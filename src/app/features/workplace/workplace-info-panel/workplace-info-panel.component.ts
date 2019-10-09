import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ChangeDataOwnerDialogComponent } from '@shared/components/change-data-owner-dialog/change-data-owner-dialog.component';
import { CancelDataOwnerDialogComponent } from '@shared/components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
})
export class WorkplaceInfoPanelComponent implements OnInit, OnDestroy {
  @Output() public changeOwnershipEvent = new EventEmitter();
  @Input() public workplace: Workplace;
  public canViewEstablishment: boolean;
  public canChangePermissionsForSubsidiary: boolean;
  public primaryWorkplace: Establishment;
  public dataOwner = WorkplaceDataOwner;
  private subscriptions: Subscription = new Subscription();
  public ownershipChangeRequestId;

  constructor(
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private permissionsService: PermissionsService,
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

  public onChangeDataOwner($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(ChangeDataOwnerDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(changeDataOwnerConfirmed => {
      if (changeDataOwnerConfirmed) {
        this.changeDataOwner();
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
    this.subscriptions.add(
      this.establishmentService.changeOwnershipDetails(this.workplace.uid).subscribe(
        data => {
          if (data) {
            this.ownershipChangeRequestId = data.ownerChangeRequestUID;
            this.workplace.ownershipChangeRequestId = this.ownershipChangeRequestId;
          }
        },
        error => {
          console.error(error.error.message);
        }
      )
    );
    const dialog = this.dialogService.open(CancelDataOwnerDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(cancelDataOwnerConfirmed => {
      if (cancelDataOwnerConfirmed) {
        this.changeDataOwner();
        this.router.navigate(['/dashboard']);
        this.alertService.addAlert({
          type: 'success',
          message: `Request to change data owner has been cancelled `,
        });
      }
    });
  }

  private changeDataOwner(): void {
    this.changeOwnershipEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
