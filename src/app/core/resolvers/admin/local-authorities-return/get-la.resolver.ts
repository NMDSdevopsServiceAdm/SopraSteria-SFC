import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';

@Injectable()
export class GetLaResolver implements Resolve<any> {
  constructor(private router: Router, private localAuthoritiesReturnService: LocalAuthoritiesReturnService) {}

  // resolve(route: ActivatedRouteSnapshot): Observable<null | LocalAuthority> {
  resolve(route: ActivatedRouteSnapshot): void {
    const uid = route.paramMap.get('uid');
    console.log('GetLaResolver');
    console.log(uid);
  }
}
