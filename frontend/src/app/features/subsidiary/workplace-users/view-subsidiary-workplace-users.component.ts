import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';

@Component({
    selector: 'app-view-subsidiary-workplace-users',
    templateUrl: './view-subsidiary-workplace-users.component.html',
    standalone: false
})
export class ViewSubsidiaryWorkplaceUsersComponent implements OnInit {
  public workplace: Establishment;
  public lastUpdatedDate: string;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workplace = this.route.snapshot.data.establishment;
    this.lastUpdatedDate = this.workplace.updated.toString();
  }

  public setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: [`/${this.workplace.uid}`, 'workplace-users'],
    });
  }
}
