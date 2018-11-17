import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

//import { HttpClient } from '@angular/common/http';


@Injectable()
export class LocationService {
  tests : any;

  constructor(private http: HttpClient) {}

  getAllLocations(): Observable<Location[]> {
    console.log("getAllLocations");
    return this.http.get<Location[]>('/api/locations');
  }

  getLocationById(id: string): Observable<Location[]> {
    //let getHeaders: HttpHeaders = new HttpHeaders({
    //  'Accept': 'application/json',
    //  'Authorization': 'my-token'
    //});

    return this.http.get<Location[]>('/api/locations/${id}');
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


