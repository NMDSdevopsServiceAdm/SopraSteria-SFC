import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadGuard implements CanActivate {
	constructor(private authService: AuthService, private userService: UserService, private router: Router) { }

	canActivate() {
		if (this.userService.loggedInUser && this.userService.loggedInUser.role === 'Admin') {
			return true;
		} else {
			if (this.authService.isFirstBulkUpload) {
				this.router.navigate(['bulk-upload', 'start']);
				return false;
			}
		}
		return true;
	}
}
