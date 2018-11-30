import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { RegistrationService } from './registration.service';
import { RegistrationModel } from '../model/registration.model';

//import { HttpClient } from '@angular/common/http';


@Injectable()
export class LocationService {
  //tests: any;

  constructor(private http: HttpClient) {}

  getAllLocations(): Observable<Location[]> {
    console.log("getAllLocations from local server");
    return this.http.get<Location[]>('/api/locations').pipe(
      map(res => res)
    );
  }

  getLocationByid(id: string): Observable<Location> {
    //let getHeaders: HttpHeaders = new HttpHeaders({
    //  'Accept': 'application/json',
    //  'Authorization': 'my-token'
    //});

    const $value = id;

    return this.http.get<Location>('/api/locations/' + $value);
  }

  //getLocationByLocationId(id: string): Observable<RegistrationModel> {
  //  //let getHeaders: HttpHeaders = new HttpHeaders({
  //  //  'Accept': 'application/json',
  //  //  'Authorization': 'my-token'
  //  //});

  //  const $value = id;

  //  return this.http.get<RegistrationModel>('/api/locations/lid/' + $value);
  //}

  getLocationByPostCode(id: string): Observable<Location[]> {
    //let getHeaders: HttpHeaders = new HttpHeaders({
    //  'Accept': 'application/json',
    //  'Authorization': 'my-token'
    //});

    const $value = id;

    //return this.http.get<Location[]>('/api/locations/pc/' + $value);

    return this.http.get<Location[]>('/api/locations/pc/' + $value);

    //for (location of locationAPI) {
    //  console.log("For each " + JSON.stringify(locationAPI));
    //}
  }

  //this.LocationService.getAllLocations()
  //.subscribe(
  //  (data: Location[]) => this.allLocations = data,
  //  (err: any) => console.log(err),
  //  () => console.log('All done getting locations')
  //);
  

  //checkData(data) {
  //  console.log(data);
  //}

}


