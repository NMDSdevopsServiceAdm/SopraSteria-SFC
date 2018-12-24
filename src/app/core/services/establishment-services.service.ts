import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';

import { ServicesModel } from '../model/services.model';
import { PostServicesModel } from '../model/postServices.model';
import { RegistrationTrackerError } from '../model/registrationTrackerError.model';

@Injectable({
  providedIn: 'root'
})
export class EstablishmentServicesService {
  header: {};

  constructor(private http: HttpClient, private router: Router) {

    this.header = {
      headers: {
        //Authorization: 79,
        Authorization: 182,
        'Content-Type': 'application/json'
      }
    };
  }

  // GET all services [true:false]
  getAllServices(value: any) {
    const $value = value;
    const $id = '182';
    const options = { headers: { 'Authorization': $id, 'Content-type': 'application/json' } };
    //debugger;
    return this.http.get<ServicesModel>('/api/establishment/' + $id + '/services?all=' + $value, options)
      .pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  // POST other services
  postOtherServices(obj: PostServicesModel) {
    const $obj = { services: obj };
    const $id = '182';
    const options = { headers: { 'Authorization': $id, 'Content-type': 'application/json' } };
    //debugger;
    return this.http.post<PostServicesModel>('/api/establishment/' + $id + '/services', $obj, options)
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

}








