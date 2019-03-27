import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';

import { RegistrationModel } from '../model/registration.model';
import { RegistrationTrackerError } from '../model/registrationTrackerError.model';

const initialRegistration: RegistrationModel = {
  // Example initial dummy data
  success: 1,
  message: 'Successful',
  detailsChanged: false,
  userRoute: {
    currentPage: 1,
    route: [],
  },
  locationdata: [
    {
      addressLine1: '',
      addressLine2: '',
      county: '',
      locationId: '',
      locationName: '',
      mainService: '',
      postalCode: '',
      townCity: '',
      isRegulated: null,
      user: {
        fullname: '',
        jobTitle: '',
        emailAddress: '',
        contactNumber: '',
        username: '',
        password: '',
        securityQuestion: '',
        securityAnswer: '',
      },
    },
  ],
  postcodedata: [
    {
      locationName: '',
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      county: '',
      postalCode: '',
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  // Observable registration source
  private _registration$: BehaviorSubject<RegistrationModel> = new BehaviorSubject<RegistrationModel>(
    initialRegistration
  );

  // Observable registration stream
  public registration$: Observable<RegistrationModel> = this._registration$.asObservable();
  // registrationModel: RegistrationModel[];

  constructor(private http: HttpClient, private router: Router) {}

  postRegistration(id: any) {
    this.http.post<RegistrationModel>('/api/registration/', id.locationdata).subscribe(
      data => console.log(data),
      error => console.log(error),
      () => {
        this.router.navigate(['/registration-complete']);
      }
    );
  }

  getLocationByPostCode(id: string) {
    return this.http
      .get<RegistrationModel>(`/api/locations/pc/${id}`)
      .pipe(catchError(err => this.handleHttpError(err)));
  }

  getLocationByLocationId(id: string) {
    return this.http
      .get<RegistrationModel>(`/api/locations/lid/${id}`)
      .pipe(catchError(err => this.handleHttpError(err)));
  }

  getAddressByPostCode(id: string) {
    return this.http.get<RegistrationModel>(`/api/postcodes/${id}`).pipe(catchError(err => this.handleHttpError(err)));
  }

  getUpdatedAddressByPostCode(id: string) {
    return this.http.get<RegistrationModel>(`/api/postcodes/${id}`).pipe(catchError(err => this.handleHttpError(err)));
  }

  getMainServices(id: boolean) {
    return this.http.get(`/api/services/byCategory?cqc=${id}`).pipe(catchError(err => this.handleHttpError(err)));
  }

  getUsernameDuplicate(id: string) {
    return this.http.get(`/api/registration/username/${id}`).pipe(catchError(err => this.handleHttpError(err)));
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
