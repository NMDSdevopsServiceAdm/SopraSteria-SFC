import { Component } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { CouldNotFindWorkplaceAddressDirective } from '@shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.directive';

@Component({
  selector: 'app-could-not-find-workplace-address',
  templateUrl: './could-not-find-workplace-address.component.html',
})
export class CouldNotFindWorkplaceAddressComponent extends CouldNotFindWorkplaceAddressDirective {
  constructor(protected registrationService: RegistrationService) {
    super(registrationService);
  }
}
