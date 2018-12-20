import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';

import { LoginApiModel } from '../model/loginApi.model';
import { RegistrationTrackerError } from '../model/registrationTrackerError.model';

// const initialRegistration: LoginApiModel = {
//   // Example initial dummy data
//   username: 'Uname3',
//   password: 'Bob'
// };

@Injectable({
  providedIn: 'root'
})
export class EstablishmentServicesService {
  // // Observable login source
  // private _auth$: BehaviorSubject<LoginApiModel> = new BehaviorSubject<LoginApiModel>(initialRegistration);

  // // Observable login stream
  // public auth$: Observable<LoginApiModel> = this._auth$.asObservable();
  // // registrationModel: RegistrationModel[];
  header: {};




  constructor(private http: HttpClient, private router: Router) {

    this.header = {
      // headers: {
        Authorization: 79,
        'Content-type': 'application/json'
      // }
    };
  }

  getAllServices(id: any) {
    const $value = id;
    const $id = 79;
    return this.http.get('/api/establishment/' + $id + '/services?all=' + $value, '', this.header)
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  private handleHttpError(error: HttpErrorResponse): Observable<RegistrationTrackerError> {
    const dataError = new RegistrationTrackerError();
    dataError.message = error.message;
    dataError.success = error.error.success;
    dataError.friendlyMessage = error.error.message;
    return ErrorObservable.create(dataError);
  }

  updateState(data) {
    //this._auth$.next(data);
  }






}








