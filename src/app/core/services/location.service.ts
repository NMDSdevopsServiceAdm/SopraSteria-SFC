import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//import { HttpClient } from '@angular/common/http';


@Injectable()
export class LocationService {
  tests : any;

  constructor(private http: HttpClient) {}

  getLocationApi() {
    /*
    return this.http.get<any[]>('https://api.apis.guru/v2/list.json').subscribe(res => {
      this.checkData(res);
    });
    */
    return this.http.get<any[]>('https://api.cqc.org.uk/public/v1/locations').subscribe(res => {
      this.checkData(res);
    });
  }

  checkData(data) {
    console.log(data);
  }

}
