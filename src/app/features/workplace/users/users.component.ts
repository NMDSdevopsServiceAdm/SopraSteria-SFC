import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails, UserPermissionsType, UserStatus } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  public workplace: Establishment;
  public showSecondUserBanner: boolean;
  public users: UserDetails[] = [];
  public canAddUser: boolean;
  public canViewUser: boolean;
  public userPermissionsTypes: UserPermissionsType[];

  constructor(
    private route: ActivatedRoute,
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.MY_WORKPLACE);
    this.workplace = this.route.snapshot.data.establishment;
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

  private userSlotsAvailable(users: UserDetails[]): boolean {
    const readOnlyLimit = this.workplace.isParent ? 20 : 3;
    const editUsers = users.filter((user) => user.role === Roles.Edit);
    const readOnlyUsers = users.filter((user) => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < readOnlyLimit;
  }
}
