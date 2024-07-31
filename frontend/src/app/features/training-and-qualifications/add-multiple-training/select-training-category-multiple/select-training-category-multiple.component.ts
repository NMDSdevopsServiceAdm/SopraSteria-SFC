import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-training-category-multiple',
  templateUrl: './select-training-category-multiple.component.html',
})
export class SelectTrainingCategoryMultipleComponent implements OnInit {
  public trainingCategories: any;
  public trainingGroups = [];
  public selectedStaff;
  public subscriptions: Subscription = new Subscription();
  public form;
  public formErrorsMap;
  public submitted: boolean = false;

  constructor(
    private trainingService: TrainingService,
    private router: Router,
    public backLinkService: BackLinkService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.selectedStaff = this.trainingService.selectedStaff;
    console.log(this.selectedStaff);
    this.setBackLink();
    this.getCategories();
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public setupCategories(categories) {
    // loop through categories
    // look at training category group
    // if group is there push category into group items array without group name
    // else create new group and push category without group name

    for (let i = 0; i < categories.length; i++) {
      if (this.trainingGroups.includes(categories[i].trainingCategoryGroup)) {
        // this.trainingGroups[categories[i].trainingCategoryGroup].items.push({
        //   id: categories[i].id,
        //   label: categories[i].category,
        //   seq: categories[i].seq,
        // });
        console.log('group is here');
      } else {
        console.log('create group');
        this.trainingGroups.push({
          descriptionText: '',
          items: [],
          title: this.trainingGroups[categories[i].trainingCategoryGroup],
        });
        // this.trainingGroups[categories[i].trainingCategoryGroup] =

        // this.trainingGroups[categories[i].trainingCategoryGroup].items.push({
        //   id: categories[i].id,
        //   label: categories[i].category,
        //   seq: categories[i].seq,
        // });
      }
    }
    console.log(this.trainingGroups);

    // {
    //   groupname: {
    //     descriptionText: "",
    //     items: [{
    //       id: 1,
    //       label: "Care",
    //       seq: 0
    //     }]
    //   }
    // }
  }

  public getCategories() {
    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(
        (categories) => {
          if (categories) {
            this.trainingCategories = categories;
            console.log(this.trainingCategories);
            this.setupCategories(categories);
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  public onSubmit() {
    console.log('submit');
  }

  public onCancel(event: Event) {
    event.preventDefault();

    this.trainingService.resetSelectedStaff();
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
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
