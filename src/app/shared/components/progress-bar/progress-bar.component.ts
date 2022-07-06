import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
})
export class ProgressBarComponent implements OnInit {
  @Input() sections: string[];

  public ngOnInit(): void {
    console.log('******* progress bar *********');
  }
}
