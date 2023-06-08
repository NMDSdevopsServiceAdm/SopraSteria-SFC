import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse, PayRankingsResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksService {
  private returnToURL: URLStructure;
  private _benchmarksData$: BenchmarksResponse = null;
  constructor(private http: HttpClient) {}

  public get returnTo(): URLStructure {
    return this.returnToURL;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnToURL = returnTo;
  }

  public get benchmarksData(): BenchmarksResponse {
    return this._benchmarksData$;
  }

  public set benchmarksData(benchmarksData) {
    this._benchmarksData$ = benchmarksData;
  }

  postBenchmarkTabUsage(establishmentId: number) {
    const viewedTime = new Date();
    return this.http.post<any>(`/api/establishment/${establishmentId}/benchmarks/usage`, { viewedTime });
  }

  getTileData(establishmentId: string, tilesNeeded: string[]): Observable<BenchmarksResponse> {
    let param = '';
    if (tilesNeeded.length) {
      param = '?tiles=' + tilesNeeded.join(',');
    }
    return this.http.get<BenchmarksResponse>(`/api/establishment/${establishmentId}/benchmarks/${param}`);
  }

  getRankingData(establishmentId: string, metric: string): Observable<PayRankingsResponse> {
    return this.http.get<PayRankingsResponse>(`/api/establishment/${establishmentId}/benchmarks/rankings/${metric}`);
  }

  getAllRankingData(establishmentId: string): Observable<AllRankingsResponse> {
    return this.http.get<AllRankingsResponse>(`/api/establishment/${establishmentId}/benchmarks/rankings`);
  }
}
