import { Component, OnInit } from '@angular/core';
import { TrainingCourseService } from '../../../../core/services/training-course.service';
import { TrainingCourse } from '@core/model/training-course.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-and-manage-training-courses',
  standalone: false,
  templateUrl: './add-and-manage-training-courses.component.html',
  styleUrl: './add-and-manage-training-courses.component.scss',
})
export class AddAndManageTrainingCoursesComponent implements OnInit {
  public trainingCourses: Array<TrainingCourse>;

  constructor(private trainingCourseService: TrainingCourseService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const establishment = this.route.snapshot.data?.establishment;
    this.trainingCourseService.getTrainingCourses(establishment.uid).subscribe((trainingCourses) => {
      this.trainingCourses = trainingCourses;
    });
  }
}
