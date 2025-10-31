import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';

export type TrainingCoursesToLoad = { categoryId: number } | 'ALL';

@Injectable({
  providedIn: 'root',
})
export class TrainingCourseResolver {
  constructor(
    private trainingCourseService: TrainingCourseService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<TrainingCourse[]> {
    const workplaceUid = routeSnapshot.paramMap.get('establishmentuid') || this.establishmentService.establishmentId;
    const categoryId = routeSnapshot?.parent?.data?.trainingRecord?.trainingCategory?.id;

    if (categoryId) {
      return this.trainingCourseService.getTrainingCoursesByCategory(workplaceUid, categoryId);
    } else {
      return this.trainingCourseService.getAllTrainingCourses(workplaceUid);
    }
  }
}
