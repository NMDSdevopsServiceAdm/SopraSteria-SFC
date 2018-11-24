import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RegistrationModel } from '../model/registration.model';

const initialRegistration: RegistrationModel = 

  //Example initial dummy data

    {
      "locationId": "123",
      "locationName": "Blue Kite Home Care",
      "addressLine1": "14",
      "addressLine2": "Chapel Park Road",
      "townCity": "St Leonards On Sea",
      "county": "East Sussex",
      "postalCode": "sw154ja",
      "mainService": "",
      "isRegulated": true,
      "user": [
        {
          "fullname": "Brendan Newbanks",
          "jobTitle": "Care assistant",
          "emailAddress": "brendan@gmail.com",
          "contactNumber": "07777777772",
          "username": "brendannewbanks",
          "password": "password1",
          "securityQuestion": "If I could be any transformer, who would I be?",
          "securityAnswer": "Soundwave"
        }
      ]
    }
  



@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  //Observable registration source
  private _registration$: BehaviorSubject<RegistrationModel[]> = new BehaviorSubject<RegistrationModel[]>(initialRegistration);

  //Observable registration stream
  public registration$: Observable<RegistrationModel[]> = this._registration$.asObservable();
  //registrationModel: RegistrationModel[];


  constructor(private http: HttpClient, private router: Router) {

    //this.http.get('/api/locations/', { responseType: 'json' })
    //  .subscribe((data: RegistrationModel) => {

    //    const registration: RegistrationModel = {

    //      locationId: data.locationId,
    //      locationName: data.locationName,
    //      addressLine1: data.addressLine1,
    //      addressLine2: data.addressLine2,
    //      townCity: data.townCity,
    //      county: data.county,
    //      postalCode: data.postalCode,
    //      mainService: data.mainService,
    //      isRegulated: data.isRegulated,

    //      fullname: data.fullname,
    //      jobTitle: data.jobTitle,
    //      emailAddress: data.emailAddress,
    //      contactNumber: data.contactNumber,
    //      username: data.username,
    //      password: data.password,
    //      securityQuestion: data.securityQuestion,
    //      securityAnswer: data.securityAnswer
    //    }

    //    this._registration$.next(registration);
    //  });

  }

  getLocationByPostCode(id: string) {
    const $value = id;

    this.http.get<RegistrationModel>('/api/locations/pc/' + $value).subscribe(
      (data: RegistrationModel) => {

        this.updateState(data);
        return this.routingCheck(data);

      },
      (err: any) => console.log(err),
      () => {
        console.log("Get location by postcode complete");
      }
    )
  }

  getLocationByLocationId(id: string) {

    const $value = id;

    this.http.get<RegistrationModel[]>('/api/locations/lid/' + $value)
      .subscribe(
        (data: RegistrationModel[]) => {

          this.updateState(data);
          this.routingCheck(data);
          //this.router.navigate(['/confirm-workplace-details']);

        },
        (err: any) => console.log(err),
        () => console.log("Get location by id sucessful")
      );
  }

  routingCheck(data) {
    debugger;

    if (data.length > 1) {
      debugger;
      this.router.navigate(['/select-workplace']);
    }
    else {
      if (data[0].mainService === '') {
        debugger;
        this.router.navigate(['/select-main-service']);
      }
      else {
        debugger;
        this.router.navigate(['/confirm-workplace-details']);
      }
        
    }

  }

  updateState(data) {
    debugger;
    if (data.length > 1) {
      debugger;
      this._registration$.next(data);
    }
    else {
      debugger;
      this._registration$.next(data);
    }

  }



 


}








