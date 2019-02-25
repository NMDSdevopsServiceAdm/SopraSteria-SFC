import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EstablishmentService } from '../../core/services/establishment.service';
import { MessageService } from '../../core/services/message.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
})
export class StaffComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  staffForm: FormGroup;

  private subscriptions = [];

  get numberOfStaff() {
    return this.staffForm.get('numStaff').value;
  }

  // TODO: improve error messaging: https://github.com/NMDSdevopsServiceAdm/SopraSteria-SFC/issues/110

  onSubmit() {
    if (this.staffForm.valid) {
      this.subscriptions.push(
        this.establishmentService.postStaff(this.numberOfStaff).subscribe(() => {
          this.router.navigate(['/dashboard']);
        })
      );
    } else {
      this.messageService.clearError();
      this.messageService.show('error', 'Enter number of staff (< 999).');
    }
  }

  ngOnInit() {
    this.staffForm = this.fb.group({
      numStaff: ['', [Validators.required, Validators.max(999)]],
    });

    // when initialising this component, get the current number of staff
    this.subscriptions.push(
      this.establishmentService.getStaff().subscribe(numberOfStaff => {
        this.staffForm.reset({
          numStaff: numberOfStaff,
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }
}
