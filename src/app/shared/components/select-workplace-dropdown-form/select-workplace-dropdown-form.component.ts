import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocationAddress } from '@core/model/location.model';
import { compact } from 'lodash';

@Component({
  selector: 'app-select-workplace-dropdown-form',
  templateUrl: './select-workplace-dropdown-form.component.html',
})
export class SelectWorkplaceDropdownFormComponent {
  @Input() form: FormGroup;
  @Input() submitted: boolean;
  @Input() locationAddresses: LocationAddress[];
  @Output() clicked = new EventEmitter<string>();

  public onLocationChange(value: string): void {
    this.clicked.emit(value);
  }

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
