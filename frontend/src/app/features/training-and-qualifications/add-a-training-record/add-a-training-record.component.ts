import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-add-a-training-record',
  templateUrl: './add-a-training-record.component.html',
})
export class AddATrainingRecord implements OnInit {
  public form: UntypedFormGroup;
  public workplace: Establishment
  public worker: Worker;
  public trainingCourses: TrainingCourse[];
  public continueText = "Continue without selecting a saved course"

  constructor(
    private workerService: WorkerService,
    private trainingCourseService: TrainingCourseService,
    private establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.workplace = this.establishmentService.establishment
    this.trainingCourses = [
      {
        id: 1,
        uid: 'uid-1',
        trainingCategoryId: 1,
        name: 'Care skills and knowledge',
        accredited: YesNoDontKnow.Yes,
        deliveredBy: DeliveredBy.InHouseStaff,
        externalProviderName: null,
        howWasItDelivered: HowWasItDelivered.FaceToFace,
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      },
      {
        id: 2,
        uid: 'uid-1',
        trainingCategoryId: 2,
        name: 'First aid course',
        accredited: YesNoDontKnow.No,
        deliveredBy: DeliveredBy.ExternalProvider,
        externalProviderName: 'Care skills academy',
        howWasItDelivered: HowWasItDelivered.ELearning,
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      },
    ];

    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        addATrainingRecord: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }



  public onSubmit(){

  }
}
