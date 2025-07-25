import { Component } from '@angular/core';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-carry-out-delegated-healthcare-activities',
  templateUrl: './carry-out-delegated-healthcare-activities.component.html',
})
export class CarryOutDelegatedHealthcareActivitiesComponent extends QuestionComponent {
  public section = 'Employment details';
  public heading = 'Do they carry out delegated healthcare activities?';

  init() {}
}
