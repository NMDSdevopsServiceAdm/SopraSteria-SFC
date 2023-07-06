import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { render } from '@testing-library/angular';

import { DataAreaRankingComponent } from './data-area-ranking.component';

describe('DataAreaRankingComponent', () => {
  let component: DataAreaRankingComponent;
  let fixture: ComponentFixture<DataAreaRankingComponent>;

  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaRankingComponent, {
      imports: [],
      providers: [],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        rankingTitle: 'Test ranking',
      },
    });
    fixture.detectChanges();
    component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show rankings when data is provided', async () => {
    const { fixture, component, queryByTestId, getByTestId } = await setup();
    component.workplaceRankNumber = 7;
    component.workplacesNumber = 10;
    fixture.detectChanges();

    expect(getByTestId('ranking-data')).toBeTruthy();
  });

  fdescribe('no workplace data message', () => {
    it('should show when no pay workplace data is provided', async () => {
      const { fixture, component, getByTestId } = await setup();
      component.workplaceRankNumber = null;
      component.workplacesNumber = 10;
      component.isPay = true;
      fixture.detectChanges();

      expect(getByTestId('no-workplace-pay-data')).toBeTruthy();
    });

    it('should show when no vacancy workplace data is provided', async () => {
      const { fixture, component, getByTestId } = await setup();
      component.workplaceRankNumber = null;
      component.workplacesNumber = 10;
      component.isPay = false;
      component.type = 'vacancy';
      fixture.detectChanges();

      expect(getByTestId('no-workplace-vacancy-data')).toBeTruthy();
    });

    it('should show when no turnover workplace data is provided', async () => {
      const { fixture, component, getByTestId } = await setup();
      component.workplaceRankNumber = null;
      component.workplacesNumber = 10;
      component.isPay = false;
      component.type = 'turnover';
      fixture.detectChanges();

      expect(getByTestId('no-workplace-turnover-or-percent-data')).toBeTruthy();
    });

    it('should show when no turnover workplace data is provided', async () => {
      const { fixture, component, getByTestId } = await setup();
      component.workplaceRankNumber = null;
      component.workplacesNumber = 10;
      component.isPay = false;
      component.type = 'timeInRole';
      fixture.detectChanges();

      expect(getByTestId('no-workplace-turnover-or-percent-data')).toBeTruthy();
    });
  });

  it('should show no comparison data message when no comparison data is provided', async () => {
    const { fixture, component, queryByTestId, getByTestId } = await setup();
    component.workplaceRankNumber = null;
    component.workplacesNumber = null;
    component.noWorkplaceData = false;
    fixture.detectChanges();

    expect(getByTestId('no-comparison-data')).toBeTruthy();
  });
  it('should show no comparison and workplace data message when no comparison and workplace data is provided', async () => {
    const { fixture, component, queryByTestId, getByTestId } = await setup();
    component.workplaceRankNumber = null;
    component.workplacesNumber = null;
    component.noWorkplaceData = true;
    fixture.detectChanges();

    expect(getByTestId('no-workplace-or-comparison-data')).toBeTruthy();
  });
});
