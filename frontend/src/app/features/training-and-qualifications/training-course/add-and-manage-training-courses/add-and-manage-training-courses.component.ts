import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.trainingCourses = this.route.snapshot.data?.trainingCourses ?? [];
  }
}
