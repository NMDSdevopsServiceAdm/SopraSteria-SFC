import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RegistrationModel } from '../model/registration.model';

const initialRegistration: RegistrationModel[] = 

  //Example initial dummy data

  [
    {
      addressLine1: "14 Shepherd's Court",
      addressLine2: "111 High Street",
      county: "Berkshire",
      locationId: "1-1000270393",
      locationName: "Red Kite Home Care",
      mainService: "Homecare agencies",
      postalCode: "SL1 7JZ",
      townCity: "Slough",
      isRegulated: true,
      user: {},
      detailsChanged: false
    }
  ]


@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  //Observable registration source
  private _registration$: BehaviorSubject<RegistrationModel[]> = new BehaviorSubject<RegistrationModel[]>(initialRegistration);

  //Observable registration stream
  public registration$: Observable<RegistrationModel[]> = this._registration$.asObservable();
  //registrationModel: RegistrationModel[];


  constructor(private http: HttpClient, private router: Router) { }

  postRegistration(id: any) {
    const $value = id;
    debugger;
    const options = { headers: { 'Content-type': 'application/json' } };
    this.http.post<RegistrationModel[]>('/api/registration/', $value, options).subscribe(
      (data) => console.log(data),
      (error) => console.log(error),
      () => {
        this.router.navigate(['/registration-complete'])
      }
    );

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

    this.http.get<RegistrationModel>('/api/locations/lid/' + $value)
      .subscribe(
        (data: RegistrationModel) => {

          this.updateState(data);
          this.routingCheck(data);
          //this.router.navigate(['/confirm-workplace-details']);

        },
        (err: any) => console.log(err),
        () => console.log("Get location by id sucessful")
      );
  }

  getAddressByPostCode(id: string) {
    const $value = id;
    this.http.get<RegistrationModel>('/api/postcodes/' + $value).subscribe(
      (data: RegistrationModel) => {
        this.updateState(data);
        this.router.navigate(['/select-workplace-address']);

      },
      (err: any) => console.log(err),
      () => {
        console.log("Get location by postcode complete");
      }
    )
  }

  getUpdatedAddressByPostCode(id: string) {
    const $value = id;
    this.http.get<RegistrationModel>('/api/postcodes/' + $value).subscribe(
      (data: RegistrationModel) => {
        this.updateState(data);

        //this.router.navigate(['/select-workplace-address']);

      },
      (err: any) => console.log(err),
      () => {
        console.log("Updated locations by postcode complete");
        console.log(this._registration$);
      }
    )
  }

  routingCheck(data) {

    if (data.length > 1) {
      this.router.navigate(['/select-workplace']);
    }
    else {
      if (data[0].mainService === '') {
        this.router.navigate(['/select-main-service']);
      }
      else {
        this.router.navigate(['/confirm-workplace-details']);
      }
        
    }
  }

  updateState(data) {
    debugger;
    this._registration$.next(data);

  }



 


}








