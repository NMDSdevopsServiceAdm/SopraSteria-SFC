import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
  styleUrls: ['./confirm-account-details.component.scss']
})
export class ConfirmAccountDetailsComponent implements OnInit {
  registration: RegistrationModel;
  tcAgreementForm: FormGroup;

  currentSection: number;
  lastSection: number;
  backLink: string;
  secondItem: number;

  submitDisabled: boolean;

  constructor(
    private _registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.tcAgreementForm = this.fb.group({
      tcAgreement: ['', Validators.required]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged')) {
      delete this.registration.detailsChanged;
      console.log(this.registration);
    }
    //this.registration[0]['detailsChanged'] = undefined;

    // Set section numbering on load
    this.setSectionNumbers();

    // Watch mainServiceSelected
    // this.tcAgreementForm.get('tcAgreement').valueChanges.subscribe(
    //   value => this.selectTCAgreementChanged(value)
    // );
    this.submitDisabled = true;
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];
    this.secondItem = 1;

    this.currentSection = (this.currentSection + 1);

    if (this.backLink === '/security-question') {
      if (this.registration.userRoute.route[this.secondItem] === '/select-workplace') {
        this.lastSection = 8;
      }
      else if (this.registration.userRoute.route[this.secondItem] === '/select-workplace-address') {
        this.lastSection = 9;
      }
      else {
        this.lastSection = 7;
      }
    }
  }

  submit() {
    this._registrationService.postRegistration(this.registration);
    //this.router.navigate(['/registration-complete']);
  }

  changeDetails() {

    this.registration['detailsChanged'] = true;
    console.log(this.registration);

    this._registrationService.updateState(this.registration);

  }

  updateSectionNumbers(data) {
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/confirm-account-details');

    // data.userRoute.currentPage = this.currentSection;
    // data.userRoute.route.push('/select-workplace');
  }

  clickBack() {
    const routeArray = this.registration.userRoute.route;
    this.currentSection = this.registration.userRoute.currentPage;
    this.currentSection = this.currentSection - 1;
    this.registration.userRoute.route.splice(-1);

    this.registration.userRoute.currentPage = this.currentSection;

    this._registrationService.updateState(this.registration);

    this.router.navigate([this.backLink]);
  }

  toggleCheckbox($event: any) {
    if ($event.checked) {
      this.submitDisabled = false;
    }
    else {
      this.submitDisabled = true;
    }
  }

}
