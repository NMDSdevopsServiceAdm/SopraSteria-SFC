import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-found-username',
  templateUrl: './found-username.component.html',
})
export class FoundUsernameComponent implements OnInit {
  public username: string = 'Bighitterhank1000';
  public isUsernameFound: boolean;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getFoundUsername();
  }

  public getFoundUsername(): void {
    //get username from FindUsernameService
    //this.username = this.findUsernameService.usernameFound

    this.isUsernameFound = this.username !== null ? true : false;
  }

  public backToSignInPage(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
