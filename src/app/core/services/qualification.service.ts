import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QualificationService {
  constructor(private http: HttpClient) {}

  getQualifications() {
    return this.http.get<any>('/api/qualification').pipe(map((res) => res.qualifications));
  }
}
