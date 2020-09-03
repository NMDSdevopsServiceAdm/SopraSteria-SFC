import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksService {
  private returnToURL: URLStructure;
  private workplaceTitleElement: ElementRef;
  private headerElement: ElementRef;
  private aboutDataElement: ElementRef;

  constructor(private http: HttpClient) {}

  public get returnTo(): URLStructure {
    return this.returnToURL
  }

  public get workplaceTitle(): ElementRef {
    return this.workplaceTitleElement;
  }

  public set workplaceTitle(workplaceTitleElement: ElementRef) {
    this.workplaceTitleElement = workplaceTitleElement;
  }

  public get header(): ElementRef {
    return this.headerElement;
  }

  public set header(headerElement: ElementRef) {
    this.headerElement = headerElement;
  }

  public get aboutData(): ElementRef {
    return this.aboutDataElement;
  }

  public set aboutData(aboutDataElement: ElementRef) {
    this.aboutDataElement = aboutDataElement;
  }

  public setReturnTo(returnTo: URLStructure):void {
    this.returnToURL = returnTo;
  }

  getTileData(establishmentId:string,tilesNeeded:string[]): Observable<BenchmarksResponse> {
    let param = '';
    if (tilesNeeded.length) {
      param = '?tiles=' + tilesNeeded.join(',');
    }
    return this.http.get<BenchmarksResponse>(`/api/establishment/${establishmentId}/benchmarks/${param}`);
  }
}
