import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadGuard implements CanActivate {
  constructor(private authService: AuthService, private bulkUploadService: BulkUploadService, private router: Router) {}

  canActivate() {
    if (!!this.authService.isFirstBulkUpload) {
      this.router.navigate(['bulk-upload', 'welcome']);
      return false;
    }
    return true;
  }
}
