import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { UserDetails, UserPermissionsType, UserStatus } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-view-subsidiary-workplace-users',
  templateUrl: './view-subsidiary-workplace-users.component.html',
})
export class ViewSubsidiaryWorkplaceUsersComponent implements OnInit {
  @Input() showSecondUserBanner: boolean;

  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public users: Array<UserDetails> = [];
  public canAddUser: boolean;
  public canViewUser: boolean;
  public userPermissionsTypes: UserPermissionsType[];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workplace = this.route.snapshot.data.establishment;
    this.setUsers();
    this.setUserServiceReturnUrl();
  }

  public setUsers(): void {
    const users = this.route.snapshot.data.users ? this.route.snapshot.data.users : [];
    this.userPermissionsTypes = getUserPermissionsTypes(true);
    this.canViewUser = this.permissionsService.can(this.workplace.uid, 'canViewUser');
    this.canAddUser = this.permissionsService.can(this.workplace.uid, 'canAddUser') && this.userSlotsAvailable(users);

    this.users = orderBy(
      users,
      ['status', 'isPrimary', 'role', (user: UserDetails) => (user.fullname ? user.fullname.toLowerCase() : 'a')],
      ['desc', 'desc', 'asc', 'asc'],
    );
  }

  public getUserType(user: UserDetails): string {
    const userType = this.userPermissionsTypes.find(
      (type) =>
        type.role === user.role &&
        type.canManageWdfClaims === user.canManageWdfClaims &&
        !!user.isPrimary === !!type.isPrimary,
    );

    return userType?.userTableValue;
  }

  public isPending(user: UserDetails): boolean {
    return user.status === UserStatus.Pending;
  }

  private userSlotsAvailable(users: Array<UserDetails>): boolean {
    const readOnlyLimit = this.workplace.isParent ? 20 : 3;
    const editUsers = users.filter((user) => user.role === Roles.Edit);
    const readOnlyUsers = users.filter((user) => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < readOnlyLimit;
  }

  private setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace-users',
    });
  }
}
