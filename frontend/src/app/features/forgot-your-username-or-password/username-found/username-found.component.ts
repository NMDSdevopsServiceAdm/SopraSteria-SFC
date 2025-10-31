import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FindUsernameService } from '@core/services/find-username.service';

@Component({
    selector: 'app-username-found',
    templateUrl: './username-found.component.html',
    styleUrls: ['./username-found.component.scss'],
    standalone: false
})
export class UsernameFoundComponent implements OnInit {
  public username: string;
  public isUsernameFound: boolean;

  constructor(private router: Router, private findUsernameService: FindUsernameService) {}

  ngOnInit(): void {
    this.getUsernameFound();
    this.isUsernameFound = this.username !== null;
  }

  public getUsernameFound(): void {
    this.username = this.findUsernameService.usernameFound;
  }

  public backToSignInPage(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
