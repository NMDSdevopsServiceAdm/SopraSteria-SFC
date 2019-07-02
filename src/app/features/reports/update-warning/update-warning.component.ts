import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-update-warning',
  templateUrl: './update-warning.component.html',
})
export class UpdateWarningComponent {
  @Input() effectiveFrom: string;

  public updateEligibilityForm: FormGroup;
  public displayTestForm = false;

  get effectiveFromDateNextYear() {
    return moment(this.effectiveFrom)
      .add(1, 'years')
      .format('YYYY');
  }
}
