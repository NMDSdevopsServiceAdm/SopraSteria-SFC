import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { LinkToParentDialogComponent } from '@shared/components/link-to-parent/link-to-parent-dialog.component';
import { Subscription } from 'rxjs';
import { isAdminRole } from 'server/utils/adminUtils';

@Component({
  selector: 'app-new-home-tab',
  templateUrl: './home-tab.component.html',
})
export class NewHomeTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public canViewWorkplaces: boolean;
  public canViewChangeDataOwner: boolean;
  public canViewDataPermissionsLink: boolean;
  public canLinkToParent: boolean;
  public canRemoveParentAssociation: boolean;
  public canBecomeAParent: boolean;
  public linkToParentRequestedStatus: boolean;
  public parentStatusRequested: boolean;
  public isLocalAuthority = false;
  public canRunLocalAuthorityReport: boolean;
  public canBulkUpload: boolean;
  public canViewReports: boolean;
  public canEditEstablishment: boolean;
  public user: UserDetails;

  constructor(
    private userService: UserService,
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private parentRequestsService: ParentRequestsService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.user = this.userService.loggedInUser;

    this.setPermissionLinks();

    if (this.workplace) {
      this.subscriptions.add(
        this.parentRequestsService.parentStatusRequested(this.workplace.id).subscribe((parentStatusRequested) => {
          this.parentStatusRequested = parentStatusRequested;
          this.setPermissionLinks();
        }),
      );

      this.isLocalAuthority =
        this.workplace.employerType && this.workplace.employerType.value.toLowerCase().startsWith('local authority');

      this.canRunLocalAuthorityReport =
        this.workplace.isParent &&
        this.isLocalAuthority &&
        this.permissionsService.can(this.workplace.uid, 'canRunLocalAuthorityReport');
    }
  }

  /**
   * This function is used to set the permission links
   * @param {void}
   * @return {void}
   */
  public setPermissionLinks() {
    const workplaceUid: string = this.workplace ? this.workplace.uid : null;
    this.canEditEstablishment = this.permissionsService.can(workplaceUid, 'canEditEstablishment');
    // this.canAddWorker = this.permissionsService.can(workplaceUid, 'canAddWorker');
    // this.canViewListOfWorkers = this.permissionsService.can(workplaceUid, 'canViewListOfWorkers');
    this.canBulkUpload = this.permissionsService.can(workplaceUid, 'canBulkUpload');
    this.canViewWorkplaces = this.workplace && this.workplace.isParent;
    this.canViewChangeDataOwner =
      this.workplace &&
      this.workplace.parentUid != null &&
      this.workplace.dataOwner !== 'Workplace' &&
      this.user.role != 'Read';
    this.canViewDataPermissionsLink =
      this.workplace &&
      this.workplace.parentUid != null &&
      this.workplace.dataOwner === 'Workplace' &&
      this.user.role != 'Read';
    this.canViewReports =
      this.permissionsService.can(workplaceUid, 'canViewWdfReport') ||
      this.permissionsService.can(workplaceUid, 'canRunLocalAuthorityReport');

    // if (this.canViewChangeDataOwner && this.workplace.dataOwnershipRequested) {
    //   this.isOwnershipRequested = true;
    // }

    if (isAdminRole(this.user.role)) {
      this.canLinkToParent = this.workplace && this.workplace.parentUid === null && !this.parentStatusRequested;
      this.canRemoveParentAssociation = this.workplace && this.workplace.parentUid !== null;
    } else {
      this.canLinkToParent =
        this.permissionsService.can(workplaceUid, 'canLinkToParent') && !this.parentStatusRequested;
      this.canRemoveParentAssociation = this.permissionsService.can(workplaceUid, 'canRemoveParentAssociation');
    }
    if (this.canLinkToParent && this.workplace.linkToParentRequested) {
      this.linkToParentRequestedStatus = true;
    }
    this.canBecomeAParent =
      this.permissionsService.can(workplaceUid, 'canBecomeAParent') && !this.linkToParentRequestedStatus;
  }

  /**
   * Function used to open modal box for link a workplace to parent organisation
   * @param {event} triggred event
   * @return {void}
   */
  public linkToParent($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(LinkToParentDialogComponent, this.workplace);
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.linkToParentRequestedStatus = true;
        this.canBecomeAParent = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
