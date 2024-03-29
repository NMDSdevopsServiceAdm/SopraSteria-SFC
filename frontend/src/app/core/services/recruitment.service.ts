import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface RecruitmentResponse {
  id: number;
  from: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecruitmentService {
  constructor(private http: HttpClient) {}

  getRecruitedFrom(): Observable<RecruitmentResponse[]> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/recruitedFrom`).pipe(map(res => res.recruitedFrom));
  }
}
