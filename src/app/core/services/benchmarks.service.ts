import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  BenchmarksResponse } from '@core/model/benchmarks.model';
import { Observable } from 'rxjs';
import { URLStructure } from '@core/model/url.model';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksService {
  private returnToURL: URLStructure;

  constructor(private http: HttpClient) {}

  public get returnTo(): URLStructure {
    return this.returnToURL
  }

  public setReturnTo(returnTo: URLStructure):void {
    this.returnToURL = returnTo;
  }

  getTileData(establishmentId,tilesNeeded?): Observable<BenchmarksResponse> {
    let param = "";
    if (tilesNeeded.length) {
      param = '=' + tilesNeeded.join(',');
  }
    return this.http.get<BenchmarksResponse>(`/api/establishment/${establishmentId}/benchmarks/?tiles${param}`);
  }
}
