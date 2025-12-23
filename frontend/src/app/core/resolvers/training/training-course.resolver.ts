import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

export type TrainingCoursesToLoad = { categoryId: number } | 'ALL';

@Injectable({
  providedIn: 'root',
})
export class TrainingCourseResolver {
  constructor(
    private trainingCourseService: TrainingCourseService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<TrainingCourse[]> {
    const workplaceUid = routeSnapshot.paramMap.get('establishmentuid') || this.establishmentService.establishmentId;
    const categoryId = routeSnapshot?.parent?.data?.trainingRecord?.trainingCategory?.id;

    const canViewWorker = this.permissionsService.can(workplaceUid, 'canViewWorker');

    if (!canViewWorker) {
      return of([]);
    }

    if (categoryId) {
      return this.trainingCourseService.getTrainingCoursesByCategory(workplaceUid, categoryId);
    } else {
      return this.trainingCourseService.getAllTrainingCourses(workplaceUid);
    }
  }
}
