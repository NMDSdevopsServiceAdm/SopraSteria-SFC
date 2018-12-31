import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-type-of-employer',
  templateUrl: './type-of-employer.component.html',
  styleUrls: ['./type-of-employer.component.scss']
})
export class TypeOfEmployerComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private messageService: MessageService) {}

  form: FormGroup
  employerName: string

  options = [
    "Private sector",
    "Voluntary or charity",
    "Other"
  ]

  private subscriptions = []

  ngOnInit() {
    this.form = this.fb.group({
      employerType: ["", Validators.required]
    })

    this.subscriptions.push(
      this.establishmentService.getEmployerType().subscribe(d => {
         this.employerName = d.name
         this.form.patchValue(d)
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
