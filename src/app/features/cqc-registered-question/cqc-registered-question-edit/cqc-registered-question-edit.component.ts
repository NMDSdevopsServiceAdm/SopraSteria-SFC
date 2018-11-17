import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

import { Router, ActivatedRoute } from '@angular/router';

import { LocationService } from '../../../core/services/location.service';

import { CqcRegisteredQuestionEnteredLocation } from './cqc-regsitered-check';

// Check for content in both input fields
function checkInputValues(c: AbstractControl): { [key: string]: boolean } | null {
  const postcodeControl = c.get('cqcRegisteredPostcode');
  const locationIdControl = c.get('locationId');

  if (postcodeControl.pristine || locationIdControl.pristine) {
    return null;
  }

  //console.log("postcodeControl " + postcodeControl.value.length);
  //console.log("locationIdControl " + locationIdControl.value.length);

  if (postcodeControl.value.length < 1 && locationIdControl.value.length < 1) {
    return null;
  }

  if ((postcodeControl.value.length < 1 && locationIdControl.value.length > 0) || (postcodeControl.value.length > 0 && locationIdControl.value.length < 1)) {
    return null;
  }

  return { 'containsContent': true };
}

@Component({
  selector: 'app-cqc-registered-question-edit',
  templateUrl: './cqc-registered-question-edit.component.html',
  styleUrls: ['./cqc-registered-question-edit.component.scss']
})
export class CqcRegisteredQuestionEditComponent implements OnInit {
  cqcRegisteredQuestionForm: FormGroup;
  CqcRegisteredQuestionEnteredLocation = new CqcRegisteredQuestionEnteredLocation();

  registeredQuestionSelectedValue: string;
  emailMessage: string;

  //private validationMessages = {
  //  bothContent: 'Both inputs contain content',
  //};

  constructor(private locationService: LocationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.cqcRegisteredQuestionForm = this.fb.group({
      registeredQuestionSelected: '',
      radioSelect: 'registeredQuestionSelected',
      cqcRegisteredGroup: this.fb.group({
        cqcRegisteredPostcode: ['', Validators.maxLength(8)],
        locationId: ['', Validators.maxLength(50)],
      }, { validator: checkInputValues }),
      notRegisteredPostcode: ''
    });

    // Watch registeredQuestionSelected
    this.cqcRegisteredQuestionForm.get('registeredQuestionSelected').valueChanges.subscribe(
      value => this.registeredQuestionChanged(value)
    );
  }

  save() {
    //console.log('Selected:' + JSON.stringify(this.cqcRegisteredQuestionForm.value) );
    //console.log(this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode').value);

    this.routeQuestionCheck(this.cqcRegisteredQuestionForm, this.router);
  }

  // Check which inputs have been entered to determine the route
  routeQuestionCheck = function (input: any, router) {

    //console.log(input.get('notRegisteredPostcode').value);

    const registeredQuestionSelectedCheck = input.get('registeredQuestionSelected').value;
    const cqcRegisteredPostcodeValue = input.get('cqcRegisteredGroup.cqcRegisteredPostcode').value;
    const locationIdValue = input.get('cqcRegisteredGroup.locationId').value;
    const notRegisteredPostcodeValue = input.get('notRegisteredPostcode').value;

    //console.log(cqcRegisteredPostcodeValue);
    //console.log(locationIdValue);
    //console.log(notRegisteredPostcodeValue);

    if (registeredQuestionSelectedCheck === 'yes') {
      if (cqcRegisteredPostcodeValue) {
        router.navigate(['/select-workplace']);
        //console.log(cqcRegisteredPostcodeValue);
      }
      else if (locationIdValue) {
        router.navigate(['/confirm-workplace-details']);
        //console.log(locationIdValue);
      }
    }
    else {
      if (notRegisteredPostcodeValue) {
        router.navigate(['/select-workplace-address']);
        console.log(notRegisteredPostcodeValue);
      }
    }
  }

  //setMessage(c: AbstractControl): void {
  //  this.emailMessage = '';
  //  console.log(this.validationMessages);
  //  if ((c.touched || c.dirty) && c.errors) {
  //    this.emailMessage = Object.keys(c.errors).map(
  //      key => this.emailMessage += this.validationMessages[key]).join(' ');
  //  }
  //}

  // Check if user is CQC Registered or not and display appropriate fields
  // If not CQC registered is selected set postcodes validation
  registeredQuestionChanged(value: string): void {
    this.registeredQuestionSelectedValue = value;
    const notRegisteredPostcode = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode');

    if (this.registeredQuestionSelectedValue === "no") {
      console.log("NO");
      notRegisteredPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    }
    notRegisteredPostcode.updateValueAndValidity();

    //console.log(this.registeredQuestionSelectedValue);
  }

}




















  //  // Simple check to see which input field they enter and route to appropriate component
//  //$scope.routeQuestionCheck = function (input: any, router) {
//  //  console.log(input);


//  //  var registeredQuestionSelectedCheck = input.registeredQuestionSelected,
//  //    postcodeYesCheck = input.postcodeYes,
//  //    locationIdCheck = input.locationId,
//  //    postcodeNoCheck = input.postcodeNo;

//  //  if (registeredQuestionSelectedCheck === 'yes') {
//  //    if (postcodeYesCheck) {
//  //      router.navigate(['/select-workplace']);
//  //      console.log(postcodeYesCheck);
//  //    }
//  //    else if (locationIdCheck) {
//  //      router.navigate(['/confirm-workplace-details']);
//  //      console.log(locationIdCheck);
//  //    }
//  //  }
//  //  else {
//  //    if (postcodeNoCheck) {
//  //      router.navigate(['/select-workplace-address']);
//  //      console.log(postcodeNoCheck);
//  //    }
//  //  }

//  //}

//}



























  //CqcRegisteredQuestionForm = new FormControl('');

  //cqcRegisteredQuestionForm: FormGroup;
  //regQuestionMethod = {
  //  reqQuestionYes: '',
  //  reqQuestionNo: '',
  //  locationId: '',
  //  postalCode: ''
  //};












 // registeredQuestionSelected = new FormGroup('');

  //submitted = false;
  //let $scope: any;

  //selectedLocation: Location[];
  //locationID: string;

 // model: CqcRegisteredQuestion = new CqcRegisteredQuestion('', '', '', '');



  //ngOnInit() {

    // Email address and phone number should not have validation by default as it is dependent on what the user picks
    // Full name regex should allow for foreign letters

    //this.cqcRegisteredQuestionForm = new FormGroup({
    //  regQuestionMethod: new FormControl('', { updateOn: 'change', validators: Validators.required })
    //  //emailAddress: new FormControl(''),
    //  //phoneNumber: new FormControl('')
    //}, { updateOn: 'blur' });


  //}

  //cqcRegisteredQuestionController: function ($scope) {

  //console.log($scope.registeredQuestionSelected);

    //$scope.registeredQuestionSelected = function (s) {
    //  $scope.SelectedExistingReportData = s;
    //};

    //$scope.setWeldDataToGrid = function () {
    //  alert($scope.SelectedExistingReportData);
    //  //  $('.modal').modal('hide');
    //}

  //}

  //regQuestionMethodChanged(regQuestionMethod) {
  //  console.log("this" + regQuestionMethod);
  //}




//  onSubmit(): void {
//    //this.submitted = true;
//    console.log('Selected:' + this.cqcRegisteredQuestionForm.get('registeredQuestionSelected').value);



//    //this.locationID = this.model.locationId;

//    //console.log(this.locationID);

//    //this.locationService.getLocationById(this.locationID)
//    //  .subscribe(
//    //    (data: Location[]) => this.selectedLocation = data,
//    //    (err: any) => console.log(err),
//    //    () => console.log('Complete')
//    //  );


//    //alert(JSON.stringify(this.model));
//    //this.routeQuestionCheck(this.model, this.router);

//    //this.locationService.getLocationById(locationID)
//    //  .subscribe(
//    //    (data: Location) => this.selectedLocation = data,
//    //    (err: any) => console.log(err),
//    //    () => console.log('Complete')
//    //  );


//  }

//  routeQuestionCheck($scope) {
//    console.log($scope);
//    $scope.value = 'foo';

//    $scope.routeQuestionCheck = function (value) {
//      console.log(value);
//    }
//  }


//  // Simple check to see which input field they enter and route to appropriate component
//  //$scope.routeQuestionCheck = function (input: any, router) {
//  //  console.log(input);


//  //  var registeredQuestionSelectedCheck = input.registeredQuestionSelected,
//  //    postcodeYesCheck = input.postcodeYes,
//  //    locationIdCheck = input.locationId,
//  //    postcodeNoCheck = input.postcodeNo;

//  //  if (registeredQuestionSelectedCheck === 'yes') {
//  //    if (postcodeYesCheck) {
//  //      router.navigate(['/select-workplace']);
//  //      console.log(postcodeYesCheck);
//  //    }
//  //    else if (locationIdCheck) {
//  //      router.navigate(['/confirm-workplace-details']);
//  //      console.log(locationIdCheck);
//  //    }
//  //  }
//  //  else {
//  //    if (postcodeNoCheck) {
//  //      router.navigate(['/select-workplace-address']);
//  //      console.log(postcodeNoCheck);
//  //    }
//  //  }

//  //}

//}
