import { AfterContentInit, Component, ContentChildren, Input, OnDestroy, QueryList } from '@angular/core';
import { AccordionSectionComponent } from '../accordion-section/accordion-section.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-accordion-group',
    templateUrl: './accordion-group.component.html',
    standalone: false
})
export class AccordionGroupComponent implements AfterContentInit, OnDestroy {
  @Input() contentName?: string = 'sections';
  @ContentChildren(AccordionSectionComponent) children: QueryList<AccordionSectionComponent>;

  private expandedChildren = new Set<number>();
  private subscriptions: Subscription = new Subscription();

  ngAfterContentInit() {
    this.listenToChildrenClickEvent();
    this.updateState();
  }

  private listenToChildrenClickEvent() {
    this.children.forEach((child) => {
      this.subscriptions.add(
        child.clickEmitter.subscribe(() => {
          child.toggle();
          this.updateState();
        }),
      );
    });
  }

  private updateState() {
    const idsOfOpeningChildren = this.children
      .map((child, index) => (child.expanded ? index : null))
      .filter((index) => index !== null);

    this.expandedChildren = new Set(idsOfOpeningChildren);
  }

  get isShowingAll() {
    return this.expandedChildren.size === this.children.length;
  }

  public showAll() {
    this.children.forEach((child) => {
      child.open();
    });
    this.updateState();
  }

  public hideAll() {
    this.children.forEach((child) => {
      child.close();
    });
    this.updateState();
  }

  public toggleAll() {
    if (this.isShowingAll) {
      this.hideAll();
    } else {
      this.showAll();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
