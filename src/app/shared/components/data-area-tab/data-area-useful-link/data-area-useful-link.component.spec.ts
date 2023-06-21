import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { render } from '@testing-library/angular';

import { DataAreaUsefulLinkComponent } from './data-area-useful-link.component';

describe('DataAreaUsefulLinkComponent', () => {
  let component: DataAreaUsefulLinkComponent;
  let fixture: ComponentFixture<DataAreaUsefulLinkComponent>;

  beforeEach(async () => {
    const { fixture } = await render(DataAreaUsefulLinkComponent, {
      imports: [],
      providers: [],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        linkUrl: "['/maximising-recruitment']",
      },
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
