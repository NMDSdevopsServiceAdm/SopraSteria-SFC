import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TrainingCourseWithLinkableRecords } from '@core/model/training-course.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingCoursesWithLinkableRecordsResolver {
  constructor(
    private trainingCourseService: TrainingCourseService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<TrainingCourseWithLinkableRecords[]> {
    const workplaceUid = routeSnapshot.paramMap.get('establishmentuid') || this.establishmentService.establishmentId;
    return this.trainingCourseService.getTrainingCoursesWithLinkableRecords(workplaceUid);
  }
}
