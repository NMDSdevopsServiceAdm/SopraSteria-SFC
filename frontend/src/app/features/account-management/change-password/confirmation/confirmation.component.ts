import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    standalone: false
})
export class ChangePasswordConfirmationComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.logoutWithoutRouting();
  }
}
