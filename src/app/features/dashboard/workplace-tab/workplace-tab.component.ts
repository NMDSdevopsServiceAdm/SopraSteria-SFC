import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class WorkplaceTabComponent implements OnInit {
  @Input() workplace: Establishment;

  public updateWorkplace: boolean;
  public summaryReturnUrl: URLStructure;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const user = this.userService.loggedInUser;
    this.summaryReturnUrl = { url: ['/dashboard'], fragment: 'workplace' };
    this.updateWorkplace = !this.workplace.employerType && [Roles.Edit, Roles.Admin].includes(user.role);
  }
}
