import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FindUsernameService } from '@core/services/find-username.service';

@Component({
  selector: 'app-username-found',
  templateUrl: './username-found.component.html',
  styleUrls: ['./username-found.component.scss'],
})
export class UsernameFoundComponent implements OnInit {
  public username: string;
  public isUsernameFound: boolean;

  constructor(private router: Router, private findUsernameService: FindUsernameService) {}

  ngOnInit(): void {
    this.getUsernameFound();
  }

  public getUsernameFound(): void {
    this.username = this.findUsernameService.usernameFound;

    this.isUsernameFound = this.username !== null ? true : false;
  }

  public backToSignInPage(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
