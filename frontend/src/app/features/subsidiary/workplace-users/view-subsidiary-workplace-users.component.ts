import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-workplace-users',
  templateUrl: './view-subsidiary-workplace-users.component.html',
})
export class ViewSubsidiaryWorkplaceUsersComponent implements OnInit {
  public workplace: Establishment;
  
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workplace = this.route.snapshot.data.establishment;
    this.parentSubsidiaryViewService.getLastUpdatedDate = this.workplace.updated.toString();
  }

  public setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/workplace-users', this.workplace.uid],
    });
  }
}
