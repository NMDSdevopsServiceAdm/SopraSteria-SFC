import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { Subscription } from 'rxjs';
import { TrainingCategory } from '@core/model/training.model';
import { Router } from '@angular/router';

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
  categories: TrainingCategory[];
  public submitted: boolean = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.title = 'Select the category that best matches the training taken';
    this.setSectionHeading();
    this.getCategories();
    this.setupForm();
  }

  public onSubmit() {
    console.log(this.form);
    this.submitted = true;
    if (this.form.valid) {
      this.trainingService.setTrainingCategorySelectedForTrainingRecord(this.form.value);
    }
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
            this.trainingGroups = [];
            for (const group of this.groupNames) {
              let currentTrainingGroup = {
                title: group,
                descriptionText: '',
                items: [],
              };

              const categoryArray = [];
              categories.map((x) => {
                if (x.trainingCategoryGroup === group) {
                  categoryArray.push({
                    label: x.category,
                    id: x.id,
                    seq: x.seq,
                  });
                }
              });

              currentTrainingGroup.items = categoryArray;
              this.trainingGroups.push(currentTrainingGroup);
            }
          }
          console.log(this.trainingGroups);
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
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
