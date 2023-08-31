import { Component } from '@angular/core';
import { NewHomeTabDirective } from '@shared/directives/new-home-tab/new-home-tab.directive';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';

@Component({
  selector: 'app-subs-home-tab',
  templateUrl: './subs-home-tab.component.html',
  // styleUrls: ['./subs-home-tab.component.scss'],
  providers: [ServiceNamePipe],
})
export class SubsHomeTabComponent extends NewHomeTabDirective {}
