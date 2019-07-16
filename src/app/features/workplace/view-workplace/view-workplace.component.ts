import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { ParentPermissions } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-view-workplace',
  templateUrl: './view-workplace.component.html',
})
export class ViewWorkplaceComponent implements OnInit {
  public parentEstablishment: LoggedInEstablishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;
  public staffPermission = ParentPermissions.WorkplaceAndStaff;

  constructor(private route: ActivatedRoute, private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.parentEstablishment = this.authService.establishment;
    this.workplace = this.route.snapshot.data.establishment;

    this.summaryReturnUrl = {
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace',
    };

    this.userService.updateReturnUrl({
      url: ['/workplace', this.workplace.uid],
    });
  }

  public checkPermission(permission: ParentPermissions) {
    return this.workplace.parentPermissions === permission;
  }
}
