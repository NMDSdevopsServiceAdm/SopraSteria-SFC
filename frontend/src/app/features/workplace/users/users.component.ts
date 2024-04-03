import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails, UserPermissionsType } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  public workplace: Establishment;
  public showSecondUserBanner: boolean;
  public users: UserDetails[];
  public canAddUser: boolean;
  public canViewUser: boolean;
  public userPermissionsTypes: UserPermissionsType[];

  constructor(
    private route: ActivatedRoute,
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.MY_WORKPLACE);
    this.workplace = this.route.snapshot.data.establishment;
  }

  public setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/workplace', this.workplace.uid, 'users'],
    });
  }
}
