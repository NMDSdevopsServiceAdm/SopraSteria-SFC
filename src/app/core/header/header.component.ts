import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router"

import { AuthService } from "../services/auth-service"


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  constructor(
    private router: Router,
    private authService: AuthService
    ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn
  }

  signOut(event) {
    event.preventDefault()
    this.authService.logout()
    this.router.navigate(["/sign-out"])
  }
}
