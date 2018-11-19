import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

//import { HttpClient } from '@angular/common/http';


@Injectable()
export class LocationService {
  tests : any;

  constructor(private http: HttpClient) {}

  getAllLocations(): Observable<Location[]> {
    console.log("getAllLocations from local server");
    return this.http.get<Location[]>('/api/locations');
  }

  geLocationByid(id: string): Observable<Location[]> {
    //let getHeaders: HttpHeaders = new HttpHeaders({
    //  'Accept': 'application/json',
    //  'Authorization': 'my-token'
    //});

    const $value = id;

    return this.http.get<Location[]>('/api/locations/' + $value);
  }

  getLocationByLocationId(id: string): Observable<Location[]> {
    //let getHeaders: HttpHeaders = new HttpHeaders({
    //  'Accept': 'application/json',
    //  'Authorization': 'my-token'
    //});

    const $value = id;

    return this.http.get<Location[]>('/api/locations/lid/' + $value);
  }

  getLocationByPostCode(id: string): Observable<Location[]> {
    //let getHeaders: HttpHeaders = new HttpHeaders({
    //  'Accept': 'application/json',
    //  'Authorization': 'my-token'
    //});

    const $value = id;

    return this.http.get<Location[]>('/api/locations/pc/' + $value);
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


