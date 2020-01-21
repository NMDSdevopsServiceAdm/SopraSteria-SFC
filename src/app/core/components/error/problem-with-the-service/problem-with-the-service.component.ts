import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-problem-with-the-service',
  templateUrl: './problem-with-the-service.component.html',
})
export class ProblemWithTheServiceComponent {
  constructor(private router: Router ) {}


  ngOnInit() {
    console.log(this.router);
  }
}
