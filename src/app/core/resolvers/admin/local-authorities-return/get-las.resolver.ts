import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { LAs } from '@core/model/admin/local-authorities-return.model';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetLasResolver implements Resolve<any> {
  constructor(private router: Router, private localAuthoritiesReturnService: LocalAuthoritiesReturnService) {}

  resolve(): Observable<LAs> {
    return this.localAuthoritiesReturnService.getLAs().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
