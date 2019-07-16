import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { UserService } from '@core/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account-saved',
  templateUrl: './account-saved.component.html',
})
export class AccountSavedComponent implements OnInit {
  constructor(private userService: UserService) {}

  public returnUrl$: Observable<URLStructure>;

  ngOnInit() {
    this.returnUrl$ = this.userService.returnUrl$;
  }
}
