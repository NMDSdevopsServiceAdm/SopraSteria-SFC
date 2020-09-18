let MIN_TIME_TOLERANCE = process.env.TEST_DEV ? 1000 : 400;
let MAX_TIME_TOLERANCE = process.env.TEST_DEV ? 5000 : 1300;

exports.validatePropertyChangeHistory = (
  name,
  PropertiesResponses,
  property,
  currentValue,
  previousValue,
  username,
  requestEpoch,
  compareFunction,
  numChangeHistoryEvent = 4,
) => {
  /* eg.
    { currentValue: [ { jobId: 7, title: 'Assessment Officer' } ],
      lastSavedBy: 'Federico.Lebsack',
      lastChangedBy: 'Federico.Lebsack',
      lastSaved: '2019-01-31T07:57:09.645Z',
      lastChanged: '2019-01-31T07:57:09.645Z',
      changeHistory:
       [ { username: 'Federico.Lebsack',
           when: '2019-01-31T07:57:09.652Z',
           event: 'changed',
           change: [Object] },
         { username: 'Federico.Lebsack',
           when: '2019-01-31T07:57:09.652Z',
           event: 'saved' },
         { username: 'Federico.Lebsack',
           when: '2019-01-31T07:57:09.557Z',
           event: 'changed',
           change: [Object] },
         { username: 'Federico.Lebsack',
           when: '2019-01-31T07:57:09.557Z',
           event: 'saved' }
       ]
    }
    */
  const auditUser = username.toLowerCase();

  expect(compareFunction(property.currentValue, currentValue)).toEqual(true);

  // console.log("TEST DEBUG: Last Save time difference: ", Math.abs(new Date(property.lastSaved).getTime() - requestEpoch));
  const lastChangedResponseTime = Math.abs(new Date(property.lastChanged).getTime() - requestEpoch);
  PropertiesResponses[name] = lastChangedResponseTime;

  expect(Math.abs(new Date(property.lastSaved).getTime() - requestEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);
  expect(Math.abs(new Date(property.lastChanged).getTime() - requestEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);
  expect(property.lastSavedBy).toEqual(auditUser);
  expect(property.lastChangedBy).toEqual(auditUser);

  const changeHistory = property.changeHistory;
  //console.log("WA DEBUG change history: ", changeHistory)
  expect(Array.isArray(changeHistory)).toEqual(true);
  expect(changeHistory.length).toEqual(numChangeHistoryEvent);
  expect(changeHistory[0].username).toEqual(auditUser);
  expect(changeHistory[1].username).toEqual(auditUser);
  expect(changeHistory[2].username).toEqual(auditUser);
  expect(changeHistory[3].username).toEqual(auditUser);
  expect(Math.abs(new Date(changeHistory[0].when).getTime() - requestEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);
  expect(Math.abs(new Date(changeHistory[1].when).getTime() - requestEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);
  expect(Math.abs(new Date(changeHistory[2].when).getTime() - requestEpoch)).toBeLessThan(MAX_TIME_TOLERANCE);
  expect(Math.abs(new Date(changeHistory[3].when).getTime() - requestEpoch)).toBeLessThan(MAX_TIME_TOLERANCE);
  expect(changeHistory[0].event).toEqual('changed');
  expect(changeHistory[1].event).toEqual('saved');
  expect(changeHistory[2].event).toEqual('changed');
  expect(changeHistory[3].event).toEqual('saved');

  // validate the change event before and after property values
  expect(compareFunction(changeHistory[0].change.new, currentValue)).toEqual(true);
  expect(compareFunction(changeHistory[0].change.current, previousValue)).toEqual(true);

  return lastChangedResponseTime;
};
