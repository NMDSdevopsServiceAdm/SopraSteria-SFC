import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import { CouldNotFindWorkplaceAddressDirective } from '@shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.directive';

@Component({
  selector: 'app-could-not-find-workplace-address',
  templateUrl: './could-not-find-workplace-address.component.html',
})
export class CouldNotFindWorkplaceAddressComponent extends CouldNotFindWorkplaceAddressDirective {
  constructor(
    protected registrationService: RegistrationService,
    public backService: BackService,
    protected route: ActivatedRoute,
  ) {
    super(registrationService, backService, route);
  }
}
