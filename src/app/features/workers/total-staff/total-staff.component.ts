import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MessageService } from '@core/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      totalStaff: [null, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0), Validators.max(999)]],
    });

    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(staff => {
        this.form.patchValue({ totalStaff: staff });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearError();
  }

  onSubmit() {
    const { totalStaff } = this.form.controls;

    this.messageService.clearError();

    if (this.form.valid) {
      this.subscriptions.add(
        this.establishmentService.postStaff(totalStaff.value).subscribe(
          () => {
            this.router.navigate(['/worker', 'create-basic-records']);
          },
          error => {
            this.messageService.show('error', 'Server Error');
          }
        )
      );
    } else {
      if (totalStaff.errors.required) {
        this.messageService.show('error', 'Total Staff is required');
      } else if (totalStaff.errors.pattern) {
        this.messageService.show('error', 'Total Staff must be a number');
      } else if (totalStaff.errors.min) {
        this.messageService.show('error', `Total Staff must be greater than or equal to ${totalStaff.errors.min.min}`);
      } else if (totalStaff.errors.max) {
        this.messageService.show('error', `Total Staff must be lower than or equal to ${totalStaff.errors.max.max}`);
      }
    }
  }
}
