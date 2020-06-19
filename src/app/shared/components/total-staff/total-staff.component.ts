import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent implements OnInit, OnDestroy {
  @Input() establishmentUid: string;
  @Input() form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected establishmentService: EstablishmentService,
  ) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff(this.establishmentUid).subscribe(staff => {
        console.log("*************************** staff: " + staff);
        this.form.patchValue({ totalStaff: staff });
      })
    );
  }

  ngOnDestroy() {}
}
