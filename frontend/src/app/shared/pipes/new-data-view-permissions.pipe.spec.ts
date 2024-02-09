import { NewDataViewPermissionsPipe } from './new-data-view-permissions.pipe';
import { DataPermissions } from '@core/model/my-workplaces.model';

describe('NewDataViewPermissionsPipe', () => {
  it('create an instance', () => {
    const pipe = new NewDataViewPermissionsPipe();
    expect(pipe).toBeTruthy();
  });

  it('shows the correct text if isParent is true', () => {
    const pipe = new NewDataViewPermissionsPipe();

    expect(pipe.transform(DataPermissions.Workplace, true)).toEqual('Only their workplace details');
  });

  it('shows the correct text if isParent is false', () => {
    const pipe = new NewDataViewPermissionsPipe();

    expect(pipe.transform(DataPermissions.Workplace, false)).toEqual('Only your workplace details');
  });
});
