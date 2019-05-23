import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { MyWorkplace, MyWorkplacesResponse } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
})
export class ViewMyWorkplacesComponent implements OnInit {
  public establishment: LoggedInEstablishment | null;
  public myWorkplaces: Array<MyWorkplace>;
  public myWorkplacesCount: number;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.getMyEstablishments();
  }

  private getMyEstablishments(): void {
    this.userService.getMyEstablishments().subscribe((myWorkplaces: MyWorkplacesResponse) => {
      if (myWorkplaces.subsidaries) {
        this.myWorkplaces = myWorkplaces.subsidaries.establishments;
        this.myWorkplacesCount = myWorkplaces.subsidaries.count;
      } else {
        this.myWorkplaces = [];
        this.myWorkplacesCount = 0;
      }
      console.log(myWorkplaces, this.myWorkplaces);
    });
  }
}
