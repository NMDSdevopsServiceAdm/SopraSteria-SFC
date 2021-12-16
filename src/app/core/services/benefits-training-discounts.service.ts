import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BenefitsTrainingDiscountsService {
  private path = 'endorsed-training-providers';

  constructor(private http: HttpClient) {}

  public getBenefitsTrainingDiscounts(): Observable<any> {
    return this.http.get<any>(`${environment.cmsUri}/items/${this.path}`);
  }
}
