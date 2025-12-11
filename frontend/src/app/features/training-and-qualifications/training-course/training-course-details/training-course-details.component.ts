import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { TrainingProvider } from '@core/model/training-provider.model';
import { DeliveredBy, HowWasItDelivered, TrainingCategory } from '@core/model/training.model';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { NumberInputWithButtonsComponent } from '@shared/components/number-input-with-buttons/number-input-with-buttons.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { filter, take } from 'rxjs/operators';

type JourneyType = 'Add' | 'Edit';

@Component({
  selector: 'app-training-course-details',
  templateUrl: './training-course-details.component.html',
})
export class TrainingCourseDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('validityPeriodInMonthRef') validityPeriodInMonth: NumberInputWithButtonsComponent;
  @ViewChild('courseName') courseName: ElementRef<HTMLInputElement>;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public workplace: Establishment;
  public isAddingNewTrainingCourse: boolean;
  public journeyType: JourneyType;

  public accreditedOptions = YesNoDontKnowOptions;
  public deliveredByOptions = DeliveredBy;
  public howWasItDeliveredOptions = HowWasItDelivered;
  public trainingProviders: TrainingProvider[];
  public otherTrainingProviderId: number;
  public trainingCategories: TrainingCategory[];
  public trainingCategoryName: string;

  public heading: string;
  public sectionHeading: string;
  public selectedTrainingCourse: Partial<TrainingCourse>;
  public selectedTrainingCourseUid: string;
  public showSuggestedTray: boolean;
  public trainingProviderNamesWithoutOther: string[];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingCourseService: TrainingCourseService,
  ) {
    this.getSuggestedListOfProviders = this.getSuggestedListOfProviders.bind(this);
  }

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.determineJourneyType();
    this.setText();
    this.loadTrainingProvidersAndCategories();
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefill();
    this.backLinkService.showBackLink();
    this.clearLocalTrainingCourseDataWhenClickedAway();
    this.setTrainingProviderNamesWithoutOther();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
    this.validityPeriodInMonth.registerOnChange((newValue) => this.handleValidityPeriodChange(newValue));
  }

  private determineJourneyType() {
    this.journeyType = this.route.snapshot?.data?.journeyType ?? 'Add';
  }

  private setText() {
    switch (this.journeyType) {
      case 'Add': {
        this.heading = 'Add training course details';
        this.sectionHeading = 'Add a training course';
        break;
      }
      case 'Edit': {
        this.heading = 'Training course details';
        this.sectionHeading = 'Training and qualifications';
        break;
      }
    }
  }

  private loadTrainingProvidersAndCategories() {
    this.trainingProviders = this.route.snapshot.data.trainingProviders;
    this.otherTrainingProviderId = this.trainingProviders?.find((provider) => provider.isOther)?.id;
    this.trainingCategories = this.route.snapshot.data.trainingCategories;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        name: [null, { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)] }],
        accredited: null,
        deliveredBy: [null, { updateOn: 'change' }],
        trainingProviderId: null,
        externalProviderName: [null, { updateOn: 'change' }],
        howWasItDelivered: null,
        validityPeriodInMonth: null,
        doesNotExpire: null,
      },
      {
        updateOn: 'submit',
      },
    );

    if (this.journeyType === 'Edit') {
      this.form.addControl('trainingCategoryId', new UntypedFormControl(null));
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'name',
        type: [
          { name: 'required', message: 'Enter the training course name' },
          { name: 'maxlength', message: 'Training course name must be between 3 and 120 characters' },
          { name: 'minlength', message: 'Training course name must be between 3 and 120 characters' },
        ],
      },
      {
        item: 'validityPeriodInMonth',
        type: [
          { name: 'required', message: 'Enter the number of months' },
          { name: 'pattern', message: 'Number of months must be between 1 and 999' },
        ],
      },
      {
        item: 'doesNotExpire',
        type: [{ name: 'required', message: 'Confirm the training does not expire' }],
      },
    ];
  }

  private prefill(): void {
    if (this.journeyType === 'Add') {
      this.prefillFromLocalData();
    } else {
      this.loadSelectedTrainingCourse();
      this.prefillFromSelectedCourse();
    }
  }

  private prefillFromLocalData() {
    const trainingCourse = this.trainingCourseService.newTrainingCourseToBeAdded;
    if (!trainingCourse) {
      return;
    }

    if (trainingCourse?.trainingProvider) {
      const trainingProvider = trainingCourse.trainingProvider;
      const providerName = trainingProvider.isOther ? trainingCourse.otherTrainingProviderName : trainingProvider.name;
      trainingCourse.externalProviderName = providerName;
    }

    this.form.patchValue(trainingCourse);
  }

  private loadSelectedTrainingCourse() {
    this.selectedTrainingCourseUid = this.route.snapshot.params.trainingCourseUid;
    const gotDataInLocalService = !!this.trainingCourseService.trainingCourseToBeUpdated;

    const selectedtrainingCourse = this.trainingCourseService.trainingCourseToBeUpdated ?? this.loadFromSnapshotData();

    if (!selectedtrainingCourse) {
      this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route });
    }
    this.trainingCategoryName = this.getTrainingCategoryName(selectedtrainingCourse);

    selectedtrainingCourse.externalProviderName = this.getTrainingProviderName(selectedtrainingCourse);
    this.selectedTrainingCourse = selectedtrainingCourse;

    if (!gotDataInLocalService) {
      this.storeTempDataInLocalService();
    }
  }

  private loadFromSnapshotData(): Partial<TrainingCourse> {
    const trainingCourses: TrainingCourse[] = this.route.snapshot.data.trainingCourses;
    const selectedtrainingCourse =
      this.trainingCourseService.trainingCourseToBeUpdated ??
      trainingCourses?.find((course) => course.uid === this.selectedTrainingCourseUid);
    return selectedtrainingCourse;
  }

  private getTrainingCategoryName(selectedtrainingCourse: Partial<TrainingCourse>): string {
    return this.trainingCategories.find((category) => category.id === selectedtrainingCourse.trainingCategoryId)
      .category;
  }

  private getTrainingProviderName(selectedtrainingCourse: Partial<TrainingCourse>): string {
    // TODO: refactor this in ticket #1840
    if (!selectedtrainingCourse?.trainingProvider) {
      return null;
    }
    const trainingProvider = selectedtrainingCourse.trainingProvider;
    const providerName = trainingProvider.isOther
      ? selectedtrainingCourse.otherTrainingProviderName
      : trainingProvider.name;

    return providerName;
  }

  private storeTempDataInLocalService() {
    this.trainingCourseService.trainingCourseToBeUpdated = this.selectedTrainingCourse;
  }

  private prefillFromSelectedCourse() {
    this.form.patchValue(this.selectedTrainingCourse);
  }

  public handleValidityPeriodChange(newValue: string | number): void {
    if (newValue && newValue !== '') {
      this.clearFormControlAndKeepErrorMessages('doesNotExpire');
    }
  }

  public handleDoesNotExpireChange(event: Event): void {
    const checkboxTicked = (event.target as HTMLInputElement).checked;
    if (checkboxTicked) {
      this.clearFormControlAndKeepErrorMessages('validityPeriodInMonth');
    }
  }

  public handleChangeLinkClick(event: Event) {
    event.preventDefault();

    const courseName = this.courseName.nativeElement.value;
    if (courseName) {
      this.trainingCourseService.trainingCourseToBeUpdated = { ...this.selectedTrainingCourse, name: courseName };
    }

    this.router.navigate(['../change-category'], { relativeTo: this.route });
  }

  private clearFormControlAndKeepErrorMessages(formControlName: string): void {
    const formControl = this.form.get(formControlName);
    const existingErrors = formControl.errors;
    formControl.patchValue(null, { emitEvent: false });
    formControl.setErrors(existingErrors);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private runCrossValidation(): void {
    // manually run the cross validation and remove the validator right afterward,
    // to avoid side effects from the interaction between validityPeriodInMonth and doesNotExpire
    this.form.setValidators([CustomValidators.crossCheckTrainingCourseValidityPeriod()]);
    this.form.updateValueAndValidity();
    this.form.clearValidators();
  }

  public onSubmit() {
    this.submitted = true;
    this.runCrossValidation();

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    if (this.journeyType === 'Add') {
      this.storeNewCourseAndContinueToNextPage();
    } else if (this.journeyType === 'Edit') {
      this.storeUpdatedCourseAndContinueToConfirmationPage();
    }
  }

  private getAndProcessFormValue(): Partial<TrainingCourse> {
    // TODO: refactor in ticket #1840 when implementing the provider name input
    const trainingCourseData: Partial<TrainingCourse> = this.form.value;

    const externalProviderName = trainingCourseData.externalProviderName;
    delete trainingCourseData.externalProviderName;

    if (trainingCourseData.deliveredBy !== this.deliveredByOptions.ExternalProvider) {
      trainingCourseData.trainingProviderId = null;
      trainingCourseData.otherTrainingProviderName = null;
      return trainingCourseData;
    }

    const trainingProvider = this.getTrainingProviderIdFromName(externalProviderName);
    trainingCourseData.trainingProviderId = trainingProvider.id;
    trainingCourseData.otherTrainingProviderName = trainingProvider.isOther ? externalProviderName : null;

    return trainingCourseData;
  }

  private getTrainingProviderIdFromName(externalProviderName: string): TrainingProvider {
    const trimmedName = externalProviderName ? externalProviderName.trim() : '';
    const providerFound = this.trainingProviders.find((provider) => provider.name === trimmedName && !provider.isOther);

    if (providerFound) {
      return providerFound;
    }

    return { id: this.otherTrainingProviderId, name: 'other', isOther: true };
  }

  private storeNewCourseAndContinueToNextPage() {
    const newTrainingCourseToBeAdded: Partial<TrainingCourse> = this.getAndProcessFormValue();

    this.trainingCourseService.newTrainingCourseToBeAdded = newTrainingCourseToBeAdded;

    this.router.navigate(['../select-category'], { relativeTo: this.route });
  }

  private storeUpdatedCourseAndContinueToConfirmationPage() {
    const updatedCourse: Partial<TrainingCourse> = this.getAndProcessFormValue();

    this.trainingCourseService.trainingCourseToBeUpdated = updatedCourse;

    this.router.navigate(['../select-which-training-records-to-apply'], { relativeTo: this.route });
  }

  private clearLocalTrainingCourseDataWhenClickedAway(): void {
    const parentPath = this.journeyType === 'Add' ? 'add-training-course' : this.selectedTrainingCourseUid;
    const fieldToClear = this.journeyType === 'Add' ? 'newTrainingCourseToBeAdded' : 'trainingCourseToBeUpdated';

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes(parentPath)),
        take(1),
      )
      .subscribe(() => {
        this.trainingCourseService[fieldToClear] = null;
      });
  }

  public setTrainingProviderNamesWithoutOther(): void {
    this.trainingProviderNamesWithoutOther = this.trainingProviders
      .filter((trainingProvider) => trainingProvider.name !== 'other')
      .map((trainingProvider) => trainingProvider.name);
  }

  /**
   * Function is used to filter
   * @param {void}
   * @return {array}  array of string
   */

  public getSuggestedListOfProviders(): string[] {
    const externalProviderName = this.form.value.externalProviderName;

    let suggestedList = [];
    if (externalProviderName?.length > 0) {
      suggestedList = this.trainingProviderNamesWithoutOther.filter((trainingProvider) =>
        trainingProvider.toLowerCase().includes(externalProviderName.toLowerCase()),
      );
      this.showSuggestedTray = true;
    }

    if (suggestedList.length === 1 && externalProviderName === suggestedList[0]) {
      this.showSuggestedTray = false;
    }

    if (!this.showSuggestedTray) {
      suggestedList = [];
    }

    return suggestedList;
  }

  public setShowSuggestedTray(): void {
    this.showSuggestedTray = false;
  }
}
