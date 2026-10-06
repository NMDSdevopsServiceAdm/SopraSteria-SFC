import { TrainingStatusService } from './trainingStatus.service';

describe('TrainingStatusService', () => {
  let service: TrainingStatusService;

  beforeEach(() => {
    service = new TrainingStatusService();
    service.expiresSoonAlertDate$.next('30');
  });

  it('should return EXPIRING when training expires in exactly 30 days', () => {
    spyOn(service, 'getDaysDifference').and.returnValue(30);

    expect(service.getTrainingStatus(new Date(), false)).toEqual(service.EXPIRING);
  });

  it('should return ACTIVE when training expires in 31 days', () => {
    spyOn(service, 'getDaysDifference').and.returnValue(31);

    expect(service.getTrainingStatus(new Date(), false)).toEqual(service.ACTIVE);
  });

  it('should return EXPIRED when training expired yesterday', () => {
    spyOn(service, 'getDaysDifference').and.returnValue(-1);

    expect(service.getTrainingStatus(new Date(), false)).toEqual(service.EXPIRED);
  });

  it('should return EXPIRING when training expires today', () => {
    spyOn(service, 'getDaysDifference').and.returnValue(0);

    expect(service.getTrainingStatus(new Date(), false)).toEqual(service.EXPIRING);
  });

  it('should return MISSING when training is missing', () => {
    expect(service.getTrainingStatus(new Date(), true)).toEqual(service.MISSING);
  });
});
