import { AfterContentInit, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { AccordionItemComponent } from '../accordion-item/accordion-item.component';

@Component({
  selector: 'app-accordion-group',
  templateUrl: './accordion-group.component.html',
})
export class AccordionGroupComponent implements AfterContentInit {
  @Input() textShowHideAll?: string = 'sections';
  @ContentChildren(AccordionItemComponent) children: QueryList<AccordionItemComponent>;

  private expandedChildren = new Set<number>();

  ngAfterContentInit() {
    this.children.forEach((child, index) => {
      child.toggleEmitter.subscribe(() => {
        this.toggleChild(index);
      });
    });
    this.updateState();
  }

  toggleChild = (index: number) => {
    const childToToggle = this.children.toArray()[index];
    if (childToToggle) {
      childToToggle.expanded = !childToToggle.expanded;
    }
    this.updateState();
  };

  updateState() {
    const childrenWhichAreOpening = this.children
      .map((child, index) => (child.expanded ? index : null))
      .filter((index) => index !== null);

    this.expandedChildren = new Set(childrenWhichAreOpening);
  }

  public showAll() {
    this.children.forEach((child) => {
      child.expanded = true;
    });
    this.updateState();
  }

  public hideAll() {
    this.children.forEach((child) => {
      child.expanded = false;
    });
    this.updateState();
  }

  get isShowingAll() {
    return this.expandedChildren.size === this.children.length;
  }

  toggleAll() {
    if (this.isShowingAll) {
      this.hideAll();
    } else {
      this.showAll();
    }
  }
}
