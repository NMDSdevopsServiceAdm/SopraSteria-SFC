import { Component } from '@angular/core';
import { NewHomeTabDirective } from '@shared/directives/new-home-tab/new-home-tab.directive';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';

@Component({
    selector: 'app-parent-home-tab',
    templateUrl: './parent-home-tab.component.html',
    styleUrls: ['./parent-home-tab.component.scss'],
    providers: [ServiceNamePipe],
    standalone: false
})
export class ParentHomeTabComponent extends NewHomeTabDirective {}
