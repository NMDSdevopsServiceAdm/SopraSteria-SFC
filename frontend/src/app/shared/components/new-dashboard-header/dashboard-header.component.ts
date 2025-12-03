import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
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
  @Input() return: URLStructure = null;
  @Input() hasTrainingCourse: boolean;

  public canDeleteEstablishment: boolean;
  public canEditEstablishment: boolean;
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
    private permissionsService: PermissionsService,
    private router: Router,
    private userService: UserService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
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

  private getPermissions(): void {
    this.user = this.userService.loggedInUser;
    this.canEditEstablishment = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
    if (isAdminRole(this.user?.role)) {
      this.canDeleteEstablishment = this.permissionsService.can(this.workplace?.uid, 'canDeleteAllEstablishments');
    } else {
      this.canDeleteEstablishment = this.permissionsService.can(this.workplace?.uid, 'canDeleteEstablishment');
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
    if (this.isParentSubsidiaryView) {
      this.router.navigate([this.workplace.uid, 'delete-workplace']);
    } else {
      this.router.navigate(['/delete-workplace']);
    }
  }

  public setReturn(): void {
    this.establishmentService.setReturnTo(this.return);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
