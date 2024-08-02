/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { TrainingCategory } from '@core/model/training.model';
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
  trainingGroups: any;
  groupNames: string[];
  categories: TrainingCategory[];
  otherCategory: any;
  worker: Worker;
  public establishmentUid: string;
  workerId: any;
  public formErrorsMap: Array<ErrorDetails>;
  public previousUrl: string[];

  private exampleText = {
    'Care skills and knowledge': "'duty of care', 'safeguarding adults'",
    'IT, digital and data in the workplace': "'online safety and security', 'working with digital technology'",
    'Specific conditions and disabilities': "'dementia care', 'Oliver McGowan Mandatory Training'",
    'Health and safety in the workplace': "'fire safety', 'first aid'",
    'Staff development': "'communication', 'equality and diversity'",
  };

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
    this.setupForm();
    this.setTitle();
    this.setSectionHeading();
    this.setButtonText();
    this.setBackLink();
    this.getCategories();

    this.prefill();
    this.establishmentUid = this.route.snapshot.data.establishment.uid;
    this.setupFormErrorsMap();
    this.previousUrl = [localStorage.getItem('previousUrl')];
  }

  protected init(): void {}

  protected prefill(): void {}

  protected submit(selectedCategory: any): void {}

  protected setTitle(): void {}

  protected setSectionHeading(): void {}

  protected setButtonText(): void {}

  private getCategories(): void {
    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(
        (categories) => {
          if (categories) {
            this.categories = categories;
            // Get an array of the training groups
            let groupMap = new Map(
              categories
                .filter((x) => x.trainingCategoryGroup !== null)
                .map((x) => {
                  return [JSON.stringify(x.trainingCategoryGroup), x.trainingCategoryGroup];
                }),
            );
            this.groupNames = Array.from(groupMap.values());
            // create a new object from the groups array and populate each group with the appropriate training categories
            this.initialiseTrainingGroups(categories);
          }

          let other = categories.filter((category) => category.trainingCategoryGroup === null)[0];

          this.otherCategory = {
            catgory: {
              id: other.id,
              label: other.category,
            },
          };
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private initialiseTrainingGroups(trainingCategories) {
    this.trainingGroups = [];
    for (const group of this.groupNames) {
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
      currentTrainingGroup.descriptionText = this.getTrainingGroupDescription(currentTrainingGroup);
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

    if (this.form.valid) {
      this.submit(this.form.value);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  public onCancel(event: Event) {}

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private getTrainingGroupDescription(trainingGroup) {
    return `Training like ${this.exampleText[trainingGroup.title]}`;
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
