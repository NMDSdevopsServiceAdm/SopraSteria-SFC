import { Component, OnInit, Input } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-fp-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ForgotYourPasswordConfirmationComponent implements OnInit {
  @Input() resetPasswordLink: string;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  // goToResetPassword() {
  //   this.router.navigate(['/reset-password']);
  // }

}
