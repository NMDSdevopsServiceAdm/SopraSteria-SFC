import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"

import { MessageService } from "../../../core/services/message.service"
import { StaffService } from "../../../core/services/staff.service"

@Component({
  selector: 'app-create-staff-record',
  templateUrl: './create-staff-record.component.html',
  styleUrls: ['./create-staff-record.component.scss']
})
export class CreateStaffRecordComponent implements OnInit, OnDestroy {

  constructor(
    private staffService: StaffService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {}

  form: FormGroup

  private subscriptions = []

  private contractsAvailable = [
    {
      key: "permanent",
      label: "Permanent"
    },
    {
      key: "temporary",
      label: "Temporary"
    },
    {
      key: "poolbank",
      label: "Pool/Bank"
    },
    {
      key: "agency",
      label: "Agency"
    },
    {
      key: "other",
      label: "Other"
    }
  ]

  submitHandler() {

    // this.subscriptions.push(
      // this.staffService.createWorker()
    // )
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      fullNameOrId: ["", Validators.required],
      jobRole: ["", Validators.required],
      typeOfContract: ["", Validators.required]
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
