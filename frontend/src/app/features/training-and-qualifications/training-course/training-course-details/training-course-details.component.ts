import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-course-details',
  templateUrl: './training-course-details.component.html',
  styleUrl: './training-course-details.component.scss',
})
export class TrainingCourseDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public accreditedOptions = YesNoDontKnowOptions;
  public deliveredByOptions = DeliveredBy;
  public howWasItDeliveredOptions = HowWasItDelivered;
  private subscriptions: Subscription = new Subscription();
  public workplace: Establishment;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingCourseService: TrainingCourseService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.setupForm();
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      name: [null, { updateOn: 'submit' }],
      accredited: null,
      deliveredBy: null,
      externalProviderName: null,
      howWasItDelivered: null,
      validityPeriodInMonth: null,
      doesNotExpire: null,
    });

    const validityPeriod = this.form.get('validityPeriodInMonth');
    const doesNotExpire = this.form.get('doesNotExpire');

    this.subscriptions.add(
      validityPeriod.valueChanges.subscribe((newValue) => {
        if (newValue > 0) {
          doesNotExpire.patchValue(null);
        }
      }),
    );

    this.subscriptions.add(
      doesNotExpire.valueChanges.subscribe((newValue) => {
        if (newValue) {
          validityPeriod.patchValue(null);
        }
      }),
    );
  }

  public onSubmit() {
    this.submitted = true;
    // this.serverError = null;

    if (!this.form.valid) {
      return;
    }

    this.storeDetailsAndContinueToNextPage();
  }

  private storeDetailsAndContinueToNextPage() {
    const newTrainingCourseToBeAdded = this.form.value;

    this.trainingCourseService.newTrainingCourseToBeAdded = newTrainingCourseToBeAdded;
    this.router.navigate(['../select-category'], { relativeTo: this.route });
  }
}
