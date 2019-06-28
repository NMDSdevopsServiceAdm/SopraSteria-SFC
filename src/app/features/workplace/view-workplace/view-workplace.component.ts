import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { URLStructure } from '@core/model/url.model';
import { ParentPermissions } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-view-workplace',
  templateUrl: './view-workplace.component.html',
})
export class ViewWorkplaceComponent implements OnInit {
  public parentEstablishment: LoggedInEstablishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;

  constructor(private establishmentService: EstablishmentService, private authService: AuthService) {}

  ngOnInit() {
    this.parentEstablishment = this.authService.establishment;
    this.establishmentService.establishment$.pipe(take(1)).subscribe(establishment => {
      this.workplace = establishment;
    });

    this.summaryReturnUrl = {
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace',
    };
  }

  public checkPermission() {
    return this.workplace.parentPermissions === ParentPermissions.WorkplaceAndStaff;
  }
}
