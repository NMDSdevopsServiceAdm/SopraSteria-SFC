import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';


@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
  styleUrls: ['./select-workplace.component.scss']
})
export class SelectWorkplaceComponent implements OnInit {
  selectWorkplaceForm: FormGroup;
  registration: RegistrationModel[];
  selectedAddressId: string;
  mainService: string;

  isSubmitted = false;

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.selectWorkplaceForm = this.fb.group({
      selectWorkplaceSelected: ['', Validators.required]
    });

    // Watch selectWorkplaceSelected
    this.selectWorkplaceForm.get('selectWorkplaceSelected').valueChanges.subscribe(
      value => this.selectWorkplaceChanged(value)
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
  }

  selectWorkplaceChanged(value: string): void {
    this.selectedAddressId = this.registration[value].locationId;
    this.mainService = this.registration[value].mainService;

    console.log(this.mainService);
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.selectedAddressId) {
      this.save(this.selectedAddressId);
    }
  }

  save(selectedAddressId) {
    this._registrationService.getLocationByLocationId(selectedAddressId);
  }

}
