import { Http } from '@angular/http'
import { Injectable } from '@angular/core';
//import { HttpClient } from '@angular/common/http';


@Injectable()
export class LocationService {

  constructor(private http: Http) {}

  getLocations() {
    this.http.get('https://api.cqc.org.uk/public/v1/locations').subscribe(res => {
      console.log('test');
      console.log(res);
    })
  }
}
