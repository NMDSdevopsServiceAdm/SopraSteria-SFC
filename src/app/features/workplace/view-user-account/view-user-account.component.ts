import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RadioFieldData } from '@core/model/form-controls.model';
import { Roles } from '@core/model/roles.enum';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-view-user-account',
  templateUrl: './view-user-account.component.html',
})
export class ViewUserAccountComponent implements OnInit {
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public user: UserDetails;
  public userInfo: SummaryList[];
  public form: FormGroup;
  public roleRadios: RadioFieldData[] = [
    {
      value: Roles.Edit,
      label: 'Edit',
    },
    {
      value: Roles.Read,
      label: 'Read only',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService
  ) {
    this.user = this.route.snapshot.data.user;
    this.setAccountDetails();
  }

  ngOnInit() {
    this.breadcrumbService.show();

    this.form = this.formBuilder.group({
      role: [this.user.role, Validators.required],
      primary: this.user.isPrimary,
    });
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.user.fullname,
      },
      {
        label: 'Job title',
        data: this.user.jobTitle,
      },
      {
        label: 'Email address',
        data: this.user.email,
      },
      {
        label: 'Contact phone',
        data: this.user.phone,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.user.username,
      },
      {
        label: 'Password',
        data: '******',
      },
    ];
  }
}
