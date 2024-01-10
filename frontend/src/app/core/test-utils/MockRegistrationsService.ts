import { Injectable } from '@angular/core';
import { RegistrationsService } from '@core/services/registrations.service';
import { build } from '@jackfranklin/test-data-bot';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const mockRegistration = {
  created: dayjs.utc('20210101').format('D/M/YYYY h:mma'),
  username: 'testuser',
  name: 'Bob Bobby',
  securityQuestion: 'Do you like cheese?',
  securityQuestionAnswer: 'Yes, I really like cheese',
  email: 'bob-bob@user.com',
  phone: '01010106422',
  establishment: {
    id: 'abc',
    name: 'Test Workplace',
    isRegulated: true,
    nmdsId: '1234111',
    address: 'Address line 1',
    address2: 'Somewhere',
    address3: 'Third Line Place',
    postcode: 'ABC123',
    town: 'Nowhereville',
    county: 'Wessex',
    locationId: '1234',
    provid: '15111',
    mainService: 'Community support and outreach',
    parentEstablishmentId: '6311133333333',
    status: 'PENDING',
    uid: 'uidForAddedWorkplace',
    reviewer: null,
    inReview: false,
    employerType: { value: 'Other', other: 'other employer type' },
  },
};

export const PendingRegistration = build('PendingRegistration', {
  fields: {
    name: 'Bob Bobby',
    username: 'testuser',
    securityQuestion: 'Do you like cheese?',
    securityQuestionAnswer: 'Yes, I really like cheese',
    email: 'bob-bob@user.com',
    phone: '01010106422',
    created: dayjs.utc('20210101').format('D/M/YYYY h:mma').toString(),
    establishment: {
      id: 'abc',
      name: 'Test Workplace',
      isRegulated: true,
      nmdsId: '1234111',
      address: 'Address line 1',
      address2: 'Somewhere',
      address3: 'Third Line Place',
      postcode: 'ABC123',
      town: 'Nowhereville',
      county: 'Wessex',
      locationId: '1234',
      provid: '15111',
      parentEstablishmentId: '6311133333333',
      parentUid: 'parentUid',
      mainService: 'Community support and outreach',
      status: 'PENDING',
      uid: 'uidForAddedWorkplace',
      reviewer: null,
      inReview: false,
      employerType: { value: 'Other', other: 'other employer type' },
    },
  },
});

export const InProgressRegistration = (reviewer) => {
  return PendingRegistration({
    overrides: {
      establishment: {
        id: 'abc',
        name: 'Test Workplace',
        isRegulated: true,
        nmdsId: '1234111',
        address: 'Address line 1',
        address2: 'Somewhere',
        address3: 'Third Line Place',
        postcode: 'ABC123',
        town: 'Nowhereville',
        county: 'Wessex',
        locationId: '1234',
        provid: '15111',
        parentEstablishmentId: '6311133333333',
        parentUid: 'parentUid',
        mainService: 'Community support and outreach',
        status: 'IN PROGRESS',
        uid: 'uidForAddedWorkplace',
        reviewer: reviewer,
        inReview: true,
        employerType: { value: 'Other', other: 'other employer type' },
      },
    },
  });
};

export const RejectedRegistration = () => {
  return PendingRegistration({
    overrides: {
      establishment: {
        id: 'abc',
        name: 'Test Workplace',
        isRegulated: true,
        nmdsId: '1234111',
        address: 'Address line 1',
        address2: 'Somewhere',
        address3: 'Third Line Place',
        postcode: 'ABC123',
        town: 'Nowhereville',
        county: 'Wessex',
        locationId: '1234',
        provid: '15111',
        parentEstablishmentId: '6311133333333',
        parentUid: 'parentUid',
        mainService: 'Community support and outreach',
        status: 'REJECTED',
        uid: 'uidForAddedWorkplace',
        reviewer: null,
        inReview: false,
        employerType: { value: 'Other', other: 'other employer type' },
      },
    },
  });
};

@Injectable()
export class MockRegistrationsService extends RegistrationsService {}
