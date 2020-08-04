import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  BenchmarksResponse } from '@core/model/benchmarks.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BenchmarksService {
  constructor(private http: HttpClient) {}

  getAllTiles(establishmentId): Observable<BenchmarksResponse> {
    return this.http.get<BenchmarksResponse>(`/api/establishments/${establishmentId}/benchmarks`);
  }
}
