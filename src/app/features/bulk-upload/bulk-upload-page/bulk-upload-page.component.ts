import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-bulk-upload-page',
  templateUrl: './bulk-upload-page.component.html',
})
export class BulkUploadPageComponent implements OnInit {
  public establishment: LoggedInEstablishment | null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
  }
}
