import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ChangeDataOwnerDialogComponent } from '@shared/components/change-data-owner-dialog/change-data-owner-dialog.component';
import { Subscription } from 'rxjs';

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

  constructor(
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService
  ) { }

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
