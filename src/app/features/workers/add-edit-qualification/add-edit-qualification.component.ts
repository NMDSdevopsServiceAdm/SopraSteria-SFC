import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QualificationRequest, QualificationResponse, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-qualification',
  templateUrl: './add-edit-qualification.component.html',
})
export class AddEditQualificationComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public qualificationTypes: QualificationType[] = [];
  public qualifications: any;
  public qualificationId: string;
  public record: QualificationResponse;
  public worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.worker = this.workerService.worker;
    this.qualificationId = this.route.snapshot.params.qualificationId;
    Object.keys(QualificationType).forEach(key => {
      this.qualificationTypes[key] = QualificationType[key];
    });

    this.form = this.formBuilder.group({
      type: [null, Validators.required],
      qualification: [null, Validators.required],
      year: [
        null,
        [
          Validators.max(moment().year()),
          Validators.min(
            moment()
              .subtract(100, 'years')
              .year()
          ),
        ],
      ],
      notes: [null, Validators.maxLength(500)],
      submitted: false,
    });

    this.subscriptions.add(
      this.workerService
        .getAvailableQualifcations(this.worker.uid, QualificationType.Award)
        .subscribe(qualifications => {
          this.qualifications = qualifications;
        })
    );

    if (this.qualificationId) {
      this.subscriptions.add(
        this.workerService.getQualification(this.worker.uid, this.qualificationId).subscribe(record => {
          this.record = record;
          this.form.patchValue({
            type: record.qualification.group,
          });
        })
      );
    }
  }

  async submitHandler() {
    this.form.patchValue({ submitted: true });

    if (this.form.valid) {
      try {
        await this.saveHandler();
        if (this.qualificationId) {
          this.workerService.setQualificationEdited();
        } else {
          this.workerService.setQualificationCreated();
        }
        this.router.navigate(['/worker', this.worker.uid], {
          fragment: 'qualifications-and-training',
        });
      } catch (err) {}
    }
  }

  saveHandler(): Promise<any> {
    return new Promise((resolve, reject) => {
      const { type, qualification, year, notes } = this.form.controls;

      const record: QualificationRequest = {
        type: type.value,
        qualification: {
          id: parseInt(qualification.value, 10),
        },
        year: year.value,
        notes: notes.value,
      };

      if (this.qualificationId) {
        this.subscriptions.add(
          this.workerService
            .updateQualification(this.worker.uid, this.qualificationId, record)
            .subscribe(resolve, reject)
        );
      } else {
        this.subscriptions.add(
          this.workerService.createQualification(this.worker.uid, record).subscribe(resolve, reject)
        );
      }
    });
  }
  //     const completedDate = this.dateGroupToMoment(completed as FormGroup);
  //     const expiresDate = this.dateGroupToMoment(expires as FormGroup);

  //     const record: TrainingRecordRequest = {
  //       trainingCategory: {
  //         id: parseInt(category.value, 10),
  //       },
  //       title: title.value,
  //       accredited: accredited.value,
  //       completed: completedDate ? completedDate.toISOString() : null,
  //       expires: expiresDate ? expiresDate.toISOString() : null,
  //       notes: notes.value,
  //     };

  //     if (this.trainingRecordId) {
  //       this.subscriptions.add(
  //         this.workerService
  //           .updateTrainingRecord(this.worker.uid, this.trainingRecordId, record)
  //           .subscribe(resolve, reject)
  //       );
  //     } else {
  //       this.subscriptions.add(
  //         this.workerService.createTrainingRecord(this.worker.uid, record).subscribe(resolve, reject)
  //       );
  //     }
  //   });
  // }
}
