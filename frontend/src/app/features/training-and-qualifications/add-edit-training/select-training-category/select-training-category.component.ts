import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { Subscription } from 'rxjs';
import { TrainingCategory } from '@core/model/training.model';
import { ActivatedRoute, Router } from '@angular/router';

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

  private exampleText = {
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
    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(
        (categories) => {
          if (categories) {
            // Get an array of the training groups
            this.groupNames = this.getTrainingGroupNames(categories);

            // create a new object from the groups array and populate each group with the appropriate training categories
            this.initialiseTrainingGroups(categories);
            this.otherCategory = categories.filter((category) => category.trainingCategoryGroup === null)[0];
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private getTrainingGroupNames(categories): any[] {
    let groupMap = new Map(
      categories
        .filter((x) => x.trainingCategoryGroup !== null)
        .map((x) => {
          return [JSON.stringify(x.trainingCategoryGroup), x.trainingCategoryGroup];
        }),
    );
    return Array.from(groupMap.values()).sort();
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

  private getTrainingGroupDescription(trainingGroup) {
    return `Training like ${this.exampleText[trainingGroup.title]}`
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
