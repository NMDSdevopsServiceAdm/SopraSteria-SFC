import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { Subscription } from 'rxjs';
import { TrainingCategory } from '@core/model/training.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCategoryService } from '@core/services/training-category.service';

@Component({
  selector: 'app-select-training-category',
  templateUrl: './select-training-category.component.html',
})
export class SelectTrainingCategoryComponent implements OnInit {
  public form: FormGroup;
  section: any;
  worker: Worker;
  title: string;
  trainingGroups: any;
  groupNames: string[];
  public subscriptions: Subscription = new Subscription();
  public submitted: boolean = false;
  establishmentuid: any;
  workerId: any;
  otherCategory: any;

  private summaryText = {
    "Care skills and knowledge": "'duty of care', 'safeguarding adults'",
    "Health and safety in the workplace": "'fire safety', 'first aid'",
    "IT, digital and data in the workplace": "'online safety and security', 'working with digital technology'",
    "Specific conditions and disabilities": "'dementia care', 'Oliver McGowan Mandatory Training'",
    "Staff development": "'communication', 'equality and diversity'"
  };

  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: TrainingService,
    protected route: ActivatedRoute,
    protected workerService: WorkerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.title = 'Select the category that best matches the training taken';
    this.setSectionHeading();
    this.getCategories();
    this.setupForm();
    this.route.params.subscribe((params) => {
      if (params) {
        this.establishmentuid = params.establishmentuid;
        this.workerId = params.id;
      }
  })
}

  public onSubmit() {
    console.log(this.form);
    this.submitted = true;
    if (this.form.valid) {
      this.trainingService.setTrainingCategorySelectedForTrainingRecord(this.form.value);
    }
    this.router.navigate([`workplace/${this.establishmentuid}/training-and-qualifications-record/${this.workerId}/add-training/details`]);
  }

  public onCancel(event: any) {}

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
  }

  private getCategories(): void {
    const categories = this.route.snapshot.data.trainingCategories;
    this.sortCategoriesByTrainingGroup(categories);
    this.otherCategory = categories.filter((category) => category.trainingCategoryGroup === null)[0];
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

  private getTrainingGroupSummary(trainingGroup) {
    return `Training like ${this.summaryText[trainingGroup.title]}`
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        category: [null],
      },
      { updateOn: 'submit' },
    );
  }
}
