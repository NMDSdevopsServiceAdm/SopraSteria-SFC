import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AllRankingsResponse,
  BenchmarksResponse,
  CompareGroupsRankingsResponse,
  PayRankingsResponse,
} from '@core/model/benchmarks-v2.model';
import { URLStructure } from '@core/model/url.model';
import { Observable } from 'rxjs';
import { BenchmarksServiceBase } from './benchmarks-base.service';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksV2Service implements BenchmarksServiceBase {
  private returnToURL: URLStructure;
  private _benchmarksData$: BenchmarksResponse = null;
  private _rankingsData$: AllRankingsResponse = null;
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

  public get rankingsData(): AllRankingsResponse {
    return this._rankingsData$;
  }

  public set rankingsData(rankingsData) {
    this._rankingsData$ = rankingsData;
  }

  postBenchmarkTabUsage(establishmentId: number) {
    const viewedTime = new Date();
    return this.http.post<any>(`/api/v2/establishment/${establishmentId}/benchmarks/usage`, { viewedTime });
  }

  getTileData(establishmentId: string, tilesNeeded: string[]): Observable<BenchmarksResponse> {
    let param = '';
    if (tilesNeeded.length) {
      param = '?tiles=' + tilesNeeded.join(',');
    }
    return this.http.get<BenchmarksResponse>(`/api/v2/establishment/${establishmentId}/benchmarks`);
  }

  getRankingData(establishmentId: string, metric: string): Observable<CompareGroupsRankingsResponse> {
    return this.http.get<CompareGroupsRankingsResponse>(
      `/api/v2/establishment/${establishmentId}/benchmarks/rankings/${metric}`,
    );
  }

  getPayRankingData(establishmentId: string): Observable<PayRankingsResponse> {
    return this.http.get<PayRankingsResponse>(`/api/v2/establishment/${establishmentId}/benchmarks/rankings/pay`);
  }

  getAllRankingData(establishmentId: string): Observable<AllRankingsResponse> {
    return this.http.get<AllRankingsResponse>(`/api/v2/establishment/${establishmentId}/benchmarks/rankings`);
  }
}
