import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingService } from '@core/services/training.service';

@Component({
  selector: 'app-select-training-category-multiple',
  templateUrl: './select-training-category-multiple.component.html',
})
export class SelectTrainingCategoryMultipleComponent implements OnInit {
  public trainingGroups: any;

  constructor(private trainingService: TrainingService, private router: Router) {}

  ngOnInit(): void {
    console.log(this.trainingService.selectedStaff);
  }

  public onSubmit() {}

  public onCancel(event: Event) {
    event.preventDefault();

    this.trainingService.resetSelectedStaff();
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }
}
