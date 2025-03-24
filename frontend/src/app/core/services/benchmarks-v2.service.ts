import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AllRankingsResponse,
  BenchmarksResponse,
  BenchmarkValue,
  CombinedResponse,
  CompareGroupsRankingsResponse,
  PayRankingsResponse,
  Tile,
} from '@core/model/benchmarks-v2.model';
import { URLStructure } from '@core/model/url.model';
import { Observable } from 'rxjs';
import { BenchmarksServiceBase } from './benchmarks-base.service';
import { Tile as OldTile, BenchmarkValue as OldBenchmarkValue } from '@core/model/benchmarks.model';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksV2Service implements BenchmarksServiceBase {
  private returnToURL: URLStructure;
  private _benchmarksData$: CombinedResponse = null;
  private _rankingsData$: AllRankingsResponse = null;
  constructor(private http: HttpClient) {}

  public get returnTo(): URLStructure {
    return this.returnToURL;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnToURL = returnTo;
  }

  private initialiseOldTile(tileData: Tile): OldTile {
    function initialiseOldBenchmarkValue(benchmarkData: BenchmarkValue): OldBenchmarkValue {
      return {
        value: benchmarkData?.value ? benchmarkData.value : 0,
        stateMessage: benchmarkData?.stateMessage ? benchmarkData.stateMessage : undefined,
        hasValue: benchmarkData?.hasValue ? benchmarkData.hasValue : false,
      };
    }

    return {
      workplaceValue: initialiseOldBenchmarkValue(tileData?.workplaceValue),
      comparisonGroup: initialiseOldBenchmarkValue(tileData?.comparisonGroup),
      goodCqc: initialiseOldBenchmarkValue(tileData?.goodCqc),
      lowTurnover: initialiseOldBenchmarkValue(tileData?.lowTurnover),
      workplaces: tileData?.workplaces ? tileData?.workplaces : 0,
      staff: tileData?.staff ? tileData?.staff : 0,
    };
  }

  public get benchmarksData(): CombinedResponse {
    return this._benchmarksData$;
  }

  public set benchmarksData(benchmarksData: any) {
    this._benchmarksData$ = {
      newBenchmarks: benchmarksData,
      oldBenchmarks: {
        pay: this.initialiseOldTile(benchmarksData.careWorkerPay),
        sickness: this.initialiseOldTile(benchmarksData.sickness),
        qualifications: this.initialiseOldTile(benchmarksData.qualifications),
        turnover: this.initialiseOldTile(benchmarksData.turnoverRate),
        meta: {
          workplaces: benchmarksData.meta.workplaces,
          staff: benchmarksData.meta.staff,
          lastUpdated: benchmarksData.meta.lastUpdated,
          localAuthority: benchmarksData.meta.localAuthority,
        },
      },
    };
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
