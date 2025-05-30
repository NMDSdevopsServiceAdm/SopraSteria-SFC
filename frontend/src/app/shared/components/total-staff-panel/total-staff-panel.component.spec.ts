import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { Permissions } from '../../../../mockdata/permissions';
import { TotalStaffPanelComponent } from './total-staff-panel.component';
import { SharedModule } from '@shared/shared.module';

describe('TotalStaffPanelComponent', () => {
  let component: TotalStaffPanelComponent;
  let fixture: ComponentFixture<TotalStaffPanelComponent>;
  let permissionsService: PermissionsService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, HttpClientTestingModule, SharedModule],
        declarations: [TotalStaffPanelComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalStaffPanelComponent);
    permissionsService = TestBed.inject(PermissionsService);
    permissionsService.setPermissions(Establishment.uid, Permissions.permissions);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show total staff', () => {
    component.totalStaff = 23;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffLink = within(document.body).queryByTestId('totalStaffLink');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');

    expect(totalStaffNumber.innerHTML).toContain('23');
    expect(totalStaffLink.innerHTML).toContain('Change');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(totalStaffText.innerHTML).not.toContain('is missing');
  });

  it('should show different text, when total staff is undefined', () => {
    component.totalStaff = undefined;
    fixture.detectChanges();

    const totalStaffLink = within(document.body).queryByTestId('totalStaffLink');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');

    expect(totalStaffLink.innerHTML).toContain('Add');
    expect(totalStaffText.innerHTML).toContain('Total number of staff is missing');
  });

  it('should show staff added', () => {
    component.totalWorkers = 24;
    fixture.detectChanges();

    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');

    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('staff records added');
  });

  it('should change to single record if only 1 staff record added', () => {
    component.totalWorkers = 1;
    fixture.detectChanges();

    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');

    expect(staffAddedNumber.innerHTML).toContain('1');
    expect(staffAddedText.textContent).toContain('staff record added');
  });

  it('should show total staff and staff added but not changes if number are equal', () => {
    component.totalStaff = 24;
    component.totalWorkers = 24;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryAllByTestId('changeNumber');
    const changeText = within(document.body).queryAllByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('24');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(totalStaffText.innerHTML).not.toContain('is missing');
    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.length).toEqual(0);
    expect(changeText.length).toEqual(0);
  });

  it('should show total staff, change link, "x staff records added" and "x staff records to delete" if total staff is 0', () => {
    component.totalStaff = 0;
    component.totalWorkers = 3;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffLink = within(document.body).queryByTestId('totalStaffLink');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('0');
    expect(totalStaffLink.innerHTML).toContain('Change');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(staffAddedNumber.innerHTML).toContain('3');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.innerHTML).toContain('3');
    expect(changeText.textContent).toContain('staff records to delete');
  });

  it('should show total staff and staff added but not changes if total staff is undefined', () => {
    component.totalStaff = undefined;
    component.totalWorkers = 24;
    fixture.detectChanges();

    const totalStaffLink = within(document.body).queryByTestId('totalStaffLink');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryAllByTestId('changeNumber');
    const changeText = within(document.body).queryAllByTestId('changeText');

    expect(totalStaffLink.innerHTML).toContain('Add');
    expect(totalStaffText.innerHTML).toContain('Total number of staff is missing');
    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.length).toEqual(0);
    expect(changeText.length).toEqual(0);
  });

  it('should show total staff, staff added and changes if number are not equal but only have 1 more worker', () => {
    component.totalStaff = 24;
    component.totalWorkers = 25;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('24');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(totalStaffText.innerHTML).not.toContain('is missing');
    expect(staffAddedNumber.innerHTML).toContain('25');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.innerHTML).toContain('1');
    expect(changeText.textContent).toContain('staff record to delete');
  });

  it('should show total staff, staff added and changes if number are not equal but have more workers', () => {
    component.totalStaff = 24;
    component.totalWorkers = 300;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('24');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(totalStaffText.innerHTML).not.toContain('is missing');
    expect(staffAddedNumber.innerHTML).toContain('300');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.innerHTML).toContain('276');
    expect(changeText.textContent).toContain('staff records to delete');
  });

  it('should show total staff, staff added and changes if number are not equal but only have 1 more total staff', () => {
    component.totalStaff = 25;
    component.totalWorkers = 24;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('25');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(totalStaffText.innerHTML).not.toContain('is missing');
    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.innerHTML).toContain('1');
    expect(changeText.textContent).toContain('staff record to add');
  });

  it('should show total staff, staff added and changes if number are not equal but have more total staff', () => {
    component.totalStaff = 200;
    component.totalWorkers = 25;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('200');
    expect(totalStaffText.innerHTML).toContain('total number of staff');
    expect(totalStaffText.innerHTML).not.toContain('is missing');
    expect(staffAddedNumber.innerHTML).toContain('25');
    expect(staffAddedText.textContent).toContain('staff records added');
    expect(changeNumber.innerHTML).toContain('175');
    expect(changeText.textContent).toContain('staff records to add');
  });
});
