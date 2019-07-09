import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-references-created-page',
  templateUrl: './references-created-page.component.html',
})
export class ReferencesCreatedPageComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isFirstBulkUpload = false;
  }

}
