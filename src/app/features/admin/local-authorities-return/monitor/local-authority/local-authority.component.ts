import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { IndividualLA } from '@core/model/admin/local-authorities-return.model';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-local-authority',
  templateUrl: './local-authority.component.html',
})
export class LocalAuthorityComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public localAuthority: IndividualLA;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private localAuthoritiesService: LocalAuthoritiesReturnService,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.localAuthority = this.route.snapshot.data.localAuthority;
    this.breadcrumbService.show(JourneyType.ADMIN);
    // console.log(this.localAuthority);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      numberOfWorkers: [''],
      status: [''],
      notes: [''],
    });
  }

  public onSubmit(): void {
    console.log('submit');
  }
}
