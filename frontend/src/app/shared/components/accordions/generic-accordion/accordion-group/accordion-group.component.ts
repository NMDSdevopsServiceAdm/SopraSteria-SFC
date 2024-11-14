import { AfterContentInit, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { AccordionSectionComponent } from '../accordion-section/accordion-section.component';

@Component({
  selector: 'app-accordion-group',
  templateUrl: './accordion-group.component.html',
})
export class AccordionGroupComponent implements AfterContentInit {
  @Input() contentName?: string = 'sections';
  @ContentChildren(AccordionSectionComponent) children: QueryList<AccordionSectionComponent>;

  private expandedChildren = new Set<number>();

  ngAfterContentInit() {
    this.children.forEach((child) => {
      child.clickEmitter.subscribe(() => {
        child.toggle();
        this.updateState();
      });
    });
    this.updateState();
  }

  toggleNthChild = (index: number) => {
    const childToToggle = this.children.toArray()[index];
    if (childToToggle) {
      childToToggle.toggle();
    }
    this.updateState();
  };

  private updateState() {
    const childrenWhichAreOpening = this.children
      .map((child, index) => (child.expanded ? index : null))
      .filter((index) => index !== null);

    this.expandedChildren = new Set(childrenWhichAreOpening);
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
}
