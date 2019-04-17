import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { RegistrationModel } from '../model/registration.model';

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
  public registration$: Observable<RegistrationModel> = this._registration$.asObservable();
  public selectedLocationId$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private router: Router) {}

  postRegistration(id: any) {
    this.http.post<RegistrationModel>('/api/registration/', id.locationdata).subscribe(
      data => console.log(data),
      error => console.log(error),
      () => {
        this.router.navigate(['/registration/complete']);
      }
    );
  }

  getLocationByPostCode(id: string) {
    return this.http.get<RegistrationModel>(`/api/locations/pc/${id}`);
  }

  getLocationByLocationId(id: string) {
    return this.http.get<RegistrationModel>(`/api/locations/lid/${id}`);
  }

  getAddressByPostCode(id: string) {
    return this.http.get<RegistrationModel>(`/api/postcodes/${id}`);
  }

  getUpdatedAddressByPostCode(id: string) {
    return this.http.get<RegistrationModel>(`/api/postcodes/${id}`);
  }

  getMainServices(id: boolean) {
    return this.http.get(`/api/services/byCategory?cqc=${id}`);
  }

  getUsernameDuplicate(id: string) {
    return this.http.get(`/api/registration/username/${id}`);
  }

  updateState(data) {
    this._registration$.next(data);
  }

}
