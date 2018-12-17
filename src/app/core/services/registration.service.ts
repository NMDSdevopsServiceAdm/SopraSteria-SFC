import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';

import { RegistrationModel } from '../model/registration.model';
import { RegistrationTrackerError } from '../model/registrationTrackerError.model';

const initialRegistration: RegistrationModel = {
  // Example initial dummy data
  success: 1,
  message: 'Successful',
  detailsChanged: false,
  userRoute: {
    currentPage: 1,
    route: []
  },
  locationdata: [{
    addressLine1: '14 Shepherd\'s Court',
    addressLine2: '111 High Street',
    county: 'Berkshire',
    locationId: '1-1000270393',
    locationName: 'Red Kite Home Care',
    mainService: 'Homecare agencies',
    postalCode: 'SL1 7JZ',
    townCity: 'Slough',
    isRegulated: true,
    user: {
      fullname: 'Mike Wazowski',
      jobTitle: 'Scaring assistant',
      emailAddress: 'mike.wazowski@monsters.inc',
      contactNumber: '07828732666',
      username: 'cyclops',
      password: 'password1',
      securityQuestion: 'Who is my partner',
      securityAnswer: 'James P.Sulivan'
    }
  }],
  postcodedata: [{
    locationName: '',
    addressLine1: '14 Shepherd\'s Court',
    addressLine2: '111 High Street',
    townCity: 'Slough',
    county: 'Berkshire',
    postalCode: 'SL1 7JZ'
  }]
};


@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // Observable registration source
  private _registration$: BehaviorSubject<RegistrationModel> = new BehaviorSubject<RegistrationModel>(initialRegistration);

  // Observable registration stream
  public registration$: Observable<RegistrationModel> = this._registration$.asObservable();
  // registrationModel: RegistrationModel[];


  constructor(private http: HttpClient, private router: Router) { }

  postRegistration(id: any) {
    const $value = id.locationdata;
    const options = { headers: { 'Content-type': 'application/json' } };
    debugger;
    this.http.post<RegistrationModel>('/api/registration/', $value, options).subscribe(
      (data) => console.log(data),
      (error) => console.log(error),
      () => {
        this.router.navigate(['/registration-complete']);
      }
    );

  }

  getLocationByPostCode(id: string) {
    const $value = id;

    return this.http.get<RegistrationModel>('/api/locations/pc/' + $value)
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  getLocationByLocationId(id: string) {
    const $value = id;

    return this.http.get<RegistrationModel>('/api/locations/lid/' + $value)
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  getAddressByPostCode(id: string) {
    debugger;
    const $value = id;

    return this.http.get<RegistrationModel>('/api/postcodes/' + $value)
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  getUpdatedAddressByPostCode(id: string) {
    const $value = id;
    return this.http.get<RegistrationModel>('/api/postcodes/' + $value)
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
    // .subscribe(
    //   (data: RegistrationModel) => {
    //     this.updateState(data);

    //     // this.router.navigate(['/select-workplace-address']);

    //   },
    //   (err: any) => console.log(err),
    //   () => {
    //     console.log('Updated locations by postcode complete');
    //     console.log(this._registration$);
    //   }
    // );
  }

  getMainServices(id: boolean) {
    const $value = id;
    return this.http.get('/api/services/byCategory')
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  routingCheck(data) {
    debugger;
    if (data.locationdata.length > 1) {
      this.router.navigate(['/select-workplace']);
    } else {
      debugger;
      // if ((data.locationdata[0].mainService === '') || (data.locationdata[0].mainService === null)) {
        this.router.navigate(['/select-main-service']);
      // } else {
      //   this.router.navigate(['/confirm-workplace-details']);
      // }

    }
  }

  updateState(data) {
    this._registration$.next(data);
  }

  private handleHttpError(error: HttpErrorResponse): Observable<RegistrationTrackerError> {
    const dataError = new RegistrationTrackerError();
    dataError.message = error.message;
    dataError.success = error.error.success;
    dataError.friendlyMessage = error.error.message;
    return ErrorObservable.create(dataError);
  }






}








