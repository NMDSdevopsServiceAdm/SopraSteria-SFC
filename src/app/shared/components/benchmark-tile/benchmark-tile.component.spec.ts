import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchmarkTileComponent } from './benchmark-tile.component';

fdescribe('BenchmarkTileComponent', () => {
  let component: BenchmarkTileComponent;
  let fixture: ComponentFixture<BenchmarkTileComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchmarkTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should show title', async () => {
    component.title = 'Test title';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').innerText).toEqual('Test title');
  });

  it('should show description', async () => {
    component.description = 'Test description';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p').innerText).toEqual('Test description');
  });

  it('should have the correct class on the your workplace p when show your workplace is true', async () => {
    component.showYourWorkplace = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(`p[data-testid='yourworkplace']`).className).toEqual('govuk-!-margin-bottom-0 asc-tile-key-text asc-color-turquoise asc-tile-key-number');
  });

  it('should have the correct class on the your workplace p when show your workplace is true', async () => {
    component.showYourWorkplace = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(`p[data-testid='yourworkplace']`).className).toEqual('govuk-!-margin-bottom-0 asc-tile-key-text govuk-body-s govuk-!-margin-top-2');
  });

  it('should have the correct class on the comparison group p when show comparison group is true', async () => {
    component.showComparisonGroup = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(`p[data-testid='comparisongroup']`).className).toEqual('govuk-!-margin-bottom-0 asc-tile-key-text asc-color-turquoise asc-tile-key-number');
  });

  it('should have the correct class on the comparison group p when show comparison group is true', async () => {
    component.showComparisonGroup = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(`p[data-testid='comparisongroup']`).className).toEqual('govuk-!-margin-bottom-0 asc-tile-key-text govuk-body-s govuk-!-margin-top-2');
  });
});
