import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocationAddress } from '@core/model/location.model';

@Component({
  selector: 'app-select-workplace-dropdown-form',
  templateUrl: './select-workplace-dropdown-form.component.html',
})
export class SelectWorkplaceDropdownFormComponent {
  @Input() form: FormGroup;
  @Input() submitted: boolean;
  @Input() locationAddresses: LocationAddress[];
}
