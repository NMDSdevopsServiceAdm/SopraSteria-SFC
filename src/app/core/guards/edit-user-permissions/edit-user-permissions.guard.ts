import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EditUserPermissionsGuard implements CanActivate {
  private workplaceUid: string;
  private userUid: string;

  constructor(private router: Router, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.workplaceUid = next.params.establishmentuid;
    this.userUid = next.params.useruid;

    return this.userService.getAllUsersForEstablishment(this.workplaceUid).pipe(
      map(users => {
        if (users.length > 1) {
          return true;
        } else {
          this.navigate();
          return false;
        }
      }),
      catchError(() => {
        this.navigate();
        return of(false);
      })
    );
  }

  private navigate() {
    this.router.navigate(['/workplace', this.workplaceUid, 'user', this.userUid], {
      skipLocationChange: true,
    });
  }
}
