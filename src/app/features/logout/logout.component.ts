import { Component } from '@angular/core';
import { Router } from "@angular/router"

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent {

  constructor(
    private router: Router
  ) { }

  login() {
    this.router.navigate(["/login"])
  }
}
