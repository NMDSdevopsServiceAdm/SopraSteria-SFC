import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-all-or-selected-job-roles',
  templateUrl: './all-or-selected-job-roles.component.html',
})
export class AllOrSelectedJobRolesComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: ErrorDetails[] = [];
  public returnTo: URLStructure;
  public workplaceUid: string;
  public requiredErrorMessage: string = 'Select whether this training is for all job roles or only selected job roles';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
  ) {
    this.setupForm();
  }

  ngOnInit() {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.route.snapshot.data?.establishment?.uid;
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private navigateToNextPage() {
    this.router.navigate(['']);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.navigateToNextPage();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public onCancel(event: Event): void {
    event.preventDefault();

    this.router.navigate(['workplace', this.workplaceUid, 'add-and-manage-mandatory-training']);
  }

  private setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group({
      allOrSelectedJobRoles: [
        null,
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });

    this.formErrorsMap.push({
      item: 'allOrSelectedJobRoles',
      type: [
        {
          name: 'required',
          message: this.requiredErrorMessage,
        },
      ],
    });
  }
}
