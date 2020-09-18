import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    return this.http.get<any>('/api/recruitedFrom').pipe(map((res) => res.recruitedFrom));
  }
}
