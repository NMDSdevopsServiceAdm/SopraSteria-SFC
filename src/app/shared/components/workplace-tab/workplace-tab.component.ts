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
  @Input() summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };

  public updateWorkplace: boolean;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const user = this.userService.loggedInUser;
    this.updateWorkplace = !this.workplace.employerType && [Roles.Edit, Roles.Admin].includes(user.role);
  }
}
