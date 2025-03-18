import { Component } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-add-another-staff-record',
  templateUrl: './add-another-staff-record.component.html',
})
export class AddAnotherStaffRecordComponent {
  public form: UntypedFormGroup;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected establishmentService: EstablishmentService,
  ) {
    this.form = this.formBuilder.group({
      addAnotherStaffRecord: null,
    });
  }

  public onSubmit() {
    if (this.form.controls['addAnotherStaffRecord'].value === 'YES') {
      this.router.navigate(['/workplace', this.establishmentService.primaryWorkplace.uid, 'staff-record', 'create-staff-record', 'staff-details']);
    } else {
      this.router.navigate(['/workplace', this.establishmentService.primaryWorkplace.uid, 'staff-record', 'update-workplace-details-after-staff-changes']);
    }
  }


}