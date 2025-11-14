import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NgModule } from '@angular/core';
import { TrainingRecord } from '@core/model/training.model';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCourse } from '@core/model/training-course.model';
import { UntypedFormControl } from '@angular/forms';
import { Worker } from '@core/model/worker.model';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-include-training-course-details',
  templateUrl: './include-training-course-details.component.html',
  styleUrl: './include-training-course-details.component.scss'
})
export class IncludeTrainingCourseDetailsComponent {
  public worker: Worker;
  public trainingRecord: TrainingRecord;
  public trainingCourses: TrainingCourse[];
  public selectedTrainingCourse = new UntypedFormControl('');
  public workplace: Establishment;

  constructor(
    private route: ActivatedRoute,
    // private establishmentService: EstablishmentService,

    // private router: Router,
    // private workerService: WorkerService,
    // private alertService: AlertService,
    // protected backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    // this.workplace = this.establishmentService.establishment;
    this.workplace = this.route.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.trainingRecord = this.route.snapshot.data.trainingRecord;
    this.trainingCourses = this.route.snapshot.data.trainingCourses;
  }

  // getNextPageLink(): string {
  //   console.log("*********************")
  //   console.log(this.selectedTrainingCourse);
  //   console.log("*********************")
  //   if (this.selectedTrainingCourse === null) {
  //     return '.';
  //   } else {
  //     // return '"/workplace", this.workplace.uid, "training-and-qualifications-record", this.worker.uid, "training", this.trainingRecord.uid';
  //     return '/dashboard'
  //   }
  // }
}
