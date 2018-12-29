import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { EstablishmentService } from "../../core/services/establishment.service"
import { LocalAuthorityService } from "../../core/services/localAuthority.service"

@Component({
  selector: 'app-shareLocalAuthority',
  templateUrl: './shareLocalAuthority.component.html',
  styleUrls: ['./shareLocalAuthority.component.scss']
})
export class ShareLocalAuthorityComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private localAuthorityService: LocalAuthorityService,
    private messageService: MessageService,
    private fb: FormBuilder) {}

    shareLocalAuthoritiesForm: FormGroup

  private subscriptions = []

  get primaryAuthority() {
    return this.shareLocalAuthoritiesForm.get('primaryAuthority').value
  }

  onSubmit () {

  }

  ngOnInit() {
    this.shareLocalAuthoritiesForm = this.fb.group({
      primaryAuthority: [true, [Validators.required]],
      doNotShare: [true, [Validators.required]],
    });

    // when initialising this component, get the set of all Local Authorities (for drop down)
    this.subscriptions.push(
      this.localAuthorityService.getAuthorities().subscribe(authorities => {
        console.log('WA DEBUG: Number of authorities: ', authorities.length)

        // this.primaryAuthority.reset({
        //   primaryAuthority: true,
        // })
      })
    )

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
