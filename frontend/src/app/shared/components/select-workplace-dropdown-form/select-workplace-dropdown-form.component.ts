import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { LocationAddress } from '@core/model/location.model';
import { compact } from 'lodash';

@Component({
  selector: 'app-select-workplace-dropdown-form',
  templateUrl: './select-workplace-dropdown-form.component.html',
})
export class SelectWorkplaceDropdownFormComponent {
  @Input() form: UntypedFormGroup;
  @Input() submitted: boolean;
  @Input() locationAddresses: LocationAddress[];

  public getLocationName(location: LocationAddress): string {
    const address = [
      location.locationName,
      location.addressLine1,
      location.addressLine2,
      location.addressLine3,
      location.townCity,
      location.postalCode,
    ];
    return compact(address).join(', ');
  }
}
