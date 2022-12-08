import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TrainingCategory } from '@core/model/training.model';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';

@Component({
  selector: 'app-delete-mandatory-training-category',
  templateUrl: './delete-mandatory-training-category.component.html',
})
export class DeleteMandatoryTrainingCategoryComponent implements OnInit {
  public categories: TrainingCategory[];
  public form: FormGroup;
  constructor(
    protected backLinkService: BackLinkService,
    protected trainingService: TrainingService,
    protected route: ActivatedRoute,
  ) {}

  get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  ngOnInit(): void {
    this.setBackLink();
    const id = parseInt(this.route.snapshot.parent.url[0].path, 10);
    this.trainingService.getCategoryById(id).subscribe((x) => console.log(x));
  }

  public removeCategory(event: Event, index): void {
    event.preventDefault();
    this.categoriesArray.removeAt(index);
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
