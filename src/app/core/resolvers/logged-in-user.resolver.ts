import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggedInUserResolver implements Resolve<any> {
  constructor(private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.userService.getLoggedInUser().pipe(tap(user => (this.userService.loggedInUser = user)));
  }
}
