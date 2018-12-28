import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private messageService: MessageService,
    private fb: FormBuilder) {}

  staffForm: FormGroup

  private subscriptions = []

  get numberOfStaff() {
    return this.staffForm.get('numStaff').value
  }

  // TODO: improve error messaging: https://github.com/NMDSdevopsServiceAdm/SopraSteria-SFC/issues/110

  onSubmit () {
    if (this.staffForm.valid) {
      this.subscriptions.push(
        this.establishmentService.postStaff(this.numberOfStaff).subscribe(
          () => {
            this.router.navigate(['/welcome'])
          }))
    } else {
      this.messageService.clearError()
      this.messageService.show("error", "Enter number of staff (< 999).")
    }

  }

  ngOnInit() {
    this.staffForm = this.fb.group({
      numStaff: ['', [Validators.required, Validators.max(999)]]
    });

    // when initialising this component, get the current number of staff
    this.subscriptions.push(
      this.establishmentService.getStaff().subscribe(numberOfStaff => {
        this.staffForm.reset({
          numStaff: numberOfStaff
        })
      })
    )

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
