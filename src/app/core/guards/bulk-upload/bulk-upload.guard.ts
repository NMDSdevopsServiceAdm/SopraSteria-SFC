import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    if (this.authService.isFirstBulkUpload) {
      this.router.navigate(['bulk-upload', 'start']);
      return false;
    }
    return true;
  }
}
