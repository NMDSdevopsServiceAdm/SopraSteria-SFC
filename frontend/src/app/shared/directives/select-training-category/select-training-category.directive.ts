/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Directive()
export class SelectTrainingCategoryDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean = false;
  public subscriptions: Subscription = new Subscription();
  public title: string;
  public section: string;
  public buttonText: string;
  public trainingGroups: any;
  public categories;
  public otherCategory: any;
  public worker: Worker;
  public establishmentUid: string;
  public workerId: any;
  public formErrorsMap: Array<ErrorDetails>;
  public previousUrl: string[];
  public preFilledId: number;
  public error = false;
  public requiredErrorMessage: string = 'Select the training category';
  public submitButtonText: string = 'Continue';
  public hideOtherCheckbox: boolean = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: TrainingService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.init();
    this.setTitle();
    this.setSectionHeading();
    this.setBackLink();
    this.getCategories();
    this.setupForm();
    this.prefillForm();
    this.setupFormErrorsMap();
  }

  protected init(): void {}
  protected submit(selectedCategory: any): void {}
  protected setSectionHeading(): void {}
  public onCancel(event: Event) {}

  protected prefillForm(): void {
    let selectedCategory = this.trainingService.selectedTraining?.trainingCategory;

    if (this.route.snapshot.queryParamMap.get('trainingCategory')) {
      const mandatoryTrainingCategory = JSON.parse(this.route.snapshot.queryParamMap.get('trainingCategory'));
      let categoryId = parseInt(mandatoryTrainingCategory.id, 10);
      this.form.setValue({ category: categoryId });
      this.preFilledId = categoryId;
    } else if (selectedCategory) {
      this.form.setValue({ category: selectedCategory?.id });
      this.preFilledId = selectedCategory?.id;
    }
    this.form.get('category').updateValueAndValidity();
  }

  protected setTitle(): void {
    this.title = 'Select the category that best matches the training taken';
  }

  protected getCategories(): void {
    this.categories = this.route.snapshot.data.trainingCategories;
    this.trainingGroups = TrainingCategoryService.sortTrainingCategoryByGroups(this.categories);
    this.otherCategory = this.categories.filter((category) => category.trainingCategoryGroup === null)[0];
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    let categoryIdSelected = this.form.value.category;

    let selectedCategory = this.categories.filter((category) => {
      if (category.id === categoryIdSelected) {
        return category;
      }
    });

    if (this.form.valid) {
      this.submit(selectedCategory[0]);
    } else {
      this.error = true;
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        category: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'category',
        type: [
          {
            name: 'required',
            message: this.requiredErrorMessage,
          },
        ],
      },
    ];
  }
}
