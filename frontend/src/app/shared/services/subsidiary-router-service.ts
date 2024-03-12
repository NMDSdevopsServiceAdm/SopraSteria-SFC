import { Injectable } from '@angular/core';
import { NavigationBehaviorOptions, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { URLStructure } from '@core/model/url.model';

const exitSubsidiaryViewPages = [
  'login',
  'satisfaction-survey',
  'notifications'
]

@Injectable()
export class SubsidiaryRouterService extends Router {

  constructor(
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {
    super()
  }

  getNewRoute(commands: any[], extras?: any) {

    if (exitSubsidiaryViewPages.some(command => commands[0].includes(command))) {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
    }

    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && (!commands[0].includes('subsidiary'))) {
      // If routing to the dashboard, override fragments
      if(commands[0].toLowerCase().includes('dashboard') && extras?.fragment) {
        commands = [extras.fragment, this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;
    } else {
      // Remove forward slashes from the route
      for(let i = 0; i < commands.length; i++) {
        const splitString = commands[i].split('/').filter((command) => command.length > 0);
        Array.prototype.splice.apply(commands, [i, 1].concat(splitString));
      }
    }
      commands.unshift('subsidiary');
      console.log('SubsidiaryRouterService navigate modified: ', commands, extras);
    }
    return { commands, extras };
  }

  navigateByUrl(url: UrlTree, extras?: NavigationBehaviorOptions): Promise<boolean> {

    let urlArray = [];
    for(let segment of url.root.children.primary.segments) {
      urlArray.push(segment.path);
    }
    const navigationExtras = {
      fragment: url.fragment
    }

    const newRoute = this.getNewRoute(urlArray, navigationExtras);
    url = super.createUrlTree(newRoute.commands, newRoute.extras);

    return super.navigateByUrl(url, extras);
  }
}