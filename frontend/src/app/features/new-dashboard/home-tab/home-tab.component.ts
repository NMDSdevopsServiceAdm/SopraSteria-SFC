import { Component } from '@angular/core';
import { NewHomeTabDirective } from '@shared/directives/new-home-tab/new-home-tab.directive';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';

@Component({
    selector: 'app-new-home-tab',
    templateUrl: './home-tab.component.html',
    providers: [ServiceNamePipe],
    standalone: false
})
export class NewHomeTabComponent extends NewHomeTabDirective {}
