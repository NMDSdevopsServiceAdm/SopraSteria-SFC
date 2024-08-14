/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
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

  private summaryText = {
    'Care skills and knowledge': "'duty of care', 'safeguarding adults'",
    'Health and safety in the workplace': "'fire safety', 'first aid'",
    'IT, digital and data in the workplace': "'online safety and security', 'working with digital technology'",
    'Specific conditions and disabilities': "'dementia care', 'Oliver McGowan Mandatory Training'",
    'Staff development': "'communication', 'equality and diversity'",
  };
  accessedFromSummary: boolean;
  submitButtonText: string;

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
    this.accessedFromSummary = this.route.snapshot.parent.url[0].path.includes('confirm-training');
    this.submitButtonText = this.accessedFromSummary ? 'Save and return' : 'Continue';
    this.setupFormErrorsMap();
  }

  protected init(): void {}

  protected prefillForm(): void {
    let selectedCategory = this.trainingService.getTrainingCategorySelectedForTrainingRecord();

    if (selectedCategory !== null) {
      this.form.setValue({ category: selectedCategory?.id });
      this.preFilledId = selectedCategory?.id;
      this.form.get('category').updateValueAndValidity();
    }
  }

  protected submit(selectedCategory: any): void {}

  protected setTitle(): void {
    this.title = 'Select the category that best matches the training taken';
  }

  protected setSectionHeading(): void {}

  private getCategories(): void {
    this.categories = this.route.snapshot.data.trainingCategories;
    this.sortCategoriesByTrainingGroup(this.categories);
    this.otherCategory = this.categories.filter((category) => category.trainingCategoryGroup === null)[0];
  }

  private sortCategoriesByTrainingGroup(trainingCategories) {
    this.trainingGroups = [];
    for (const group of Object.keys(this.summaryText)) {
      let currentTrainingGroup = {
        title: group,
        descriptionText: '',
        items: [],
      };
      const categoryArray = [];
      trainingCategories.map((x) => {
        if (x.trainingCategoryGroup === group) {
          categoryArray.push({
            label: x.category,
            id: x.id,
            seq: x.seq,
          });
        }
      });
      currentTrainingGroup.items = categoryArray;
      currentTrainingGroup.descriptionText = this.getTrainingGroupSummary(currentTrainingGroup);
      this.trainingGroups.push(currentTrainingGroup);
    }
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
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  public onCancel(event: Event) {}

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private getTrainingGroupSummary(trainingGroup) {
    return `Training like ${this.summaryText[trainingGroup.title]}`;
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
            message: 'Select the training category',
          },
        ],
      },
    ];
  }
}
