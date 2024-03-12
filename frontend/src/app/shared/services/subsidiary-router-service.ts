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

  getCommands(urlTree: UrlTree) {
    let commands = [];
    for(let segment of urlTree.root.children.primary.segments) {
      commands.push(segment.path);
    }
    const navigationExtras = {
      fragment: urlTree.fragment
    }

    return { commands, navigationExtras }
  }

  getNewRoute(commands: any[], extras?: any) {
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
    const {commands, navigationExtras} = this.getCommands(url);

    if (exitSubsidiaryViewPages.some(command => commands[0].includes(command))) {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
    } else {
      const newRoute = this.getNewRoute(commands, navigationExtras);
      url = super.createUrlTree(newRoute.commands, newRoute.extras);
    }


    return super.navigateByUrl(url, extras);
  }
}