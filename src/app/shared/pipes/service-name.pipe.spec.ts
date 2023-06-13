import { ServiceNamePipe } from './service-name.pipe';

describe('ServiceNamePipe', () => {
  it('creates an instance', () => {
    const pipe = new ServiceNamePipe();
    expect(pipe).toBeTruthy();
  });

  it('formats domiciliary care services correctly', () => {
    const pipe = new ServiceNamePipe();
    expect(pipe.transform('Domiciliary care services')).toEqual('Domiciliary care');
  });

  it('formats care home services with nursing correctly', () => {
    const pipe = new ServiceNamePipe();
    expect(pipe.transform('Care Home Services With Nursing')).toEqual('Care homes with nursing');
  });

  it('formats care home services without nursing correctly', () => {
    const pipe = new ServiceNamePipe();
    expect(pipe.transform('Care Home Services without Nursing')).toEqual('Care homes without nursing');
  });

  it('does not format any other service and just returns it', () => {
    const pipe = new ServiceNamePipe();
    expect(pipe.transform('ANOTHER SERVICE')).toEqual('ANOTHER SERVICE');
  });
});
