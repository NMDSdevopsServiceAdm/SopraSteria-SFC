import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    standalone: false
})
export class UsersComponent implements OnInit {
  public workplace: Establishment;

  constructor(
    private route: ActivatedRoute,
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
