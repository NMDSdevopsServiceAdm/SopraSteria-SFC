import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  public form: UntypedFormGroup;
  public localAuthority: IndividualLA;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private localAuthoritiesService: LocalAuthoritiesReturnService,
  ) {}

  ngOnInit(): void {
    this.localAuthority = this.route.snapshot.data.localAuthority;
    this.breadcrumbService.show(JourneyType.ADMIN);
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: [this.route.snapshot.data.localAuthority.workers, ''],
      status: [this.route.snapshot.data.localAuthority.status, ''],
      notes: [this.route.snapshot.data.localAuthority.notes, ''],
    });
  }

  public onSubmit(): void {
    this.localAuthoritiesService.updateLA(this.route.snapshot.paramMap.get('uid'), this.form.value).subscribe(
      () => {
        this.router.navigate(['/sfcadmin', 'local-authorities-return', 'monitor']);
      },
      (error) => {
        console.error(error);
      },
    );
  }
}
