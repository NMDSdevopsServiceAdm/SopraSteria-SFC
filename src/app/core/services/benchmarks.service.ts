import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse, RankingsResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksService {
  private returnToURL: URLStructure;

  constructor(private http: HttpClient) {}

  public get returnTo(): URLStructure {
    return this.returnToURL;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnToURL = returnTo;
  }

  getTileData(establishmentId: string, tilesNeeded: string[]): Observable<BenchmarksResponse> {
    let param = '';
    if (tilesNeeded.length) {
      param = '?tiles=' + tilesNeeded.join(',');
    }
    return this.http.get<BenchmarksResponse>(`/api/establishment/${establishmentId}/benchmarks/${param}`);
  }

  getRankingData(establishmentId: string, metric: string): Observable<RankingsResponse> {
    return this.http.get<RankingsResponse>(`/api/establishment/${establishmentId}/benchmarks/rankings/${metric}`);
  }

  getAllRankingData(establishmentId: string): Observable<AllRankingsResponse> {
    return this.http.get<AllRankingsResponse>(`/api/establishment/${establishmentId}/benchmarks/rankings`);
  }

  logBenchmarkTabUsage(establishmentId: string): Observable<any> {
    return this.http.get<any>(`/api/establishment/${establishmentId}/benchmarks/rankings/logbenchmarks`);
  }
}
