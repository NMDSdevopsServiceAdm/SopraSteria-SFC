import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-update-records-select-training-course',
  templateUrl: './update-records-select-training-course.component.html',
  styleUrl: './update-records-select-training-course.component.scss',
  standalone: false,
})
export class UpdateRecordsSelectTrainingCourseComponent {
  public revealText = TrainingCourseService.RevealText;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected trainingCourseService: TrainingCourseService,
  ) {}
}
