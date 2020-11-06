import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { UserService } from '@core/services/user.service';
import { Observable } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-saved',
  templateUrl: './user-account-saved.component.html',
})
export class UserAccountSavedComponent implements OnInit {
  constructor(private userService: UserService, private route: ActivatedRoute) {}

  public returnUrl$: Observable<URLStructure>;
  public userDetails: UserDetails = this.route.snapshot.data.user;

  ngOnInit() {
    this.returnUrl$ = this.userService.returnUrl$;
  }
}
