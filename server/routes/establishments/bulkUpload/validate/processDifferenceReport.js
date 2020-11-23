'use strict';

// having validated bulk upload files - and generated any number of validation errors and warnings
//  if there are no error, then the user will be able to complete the upload. But to be
//  able to complete on the upload though, they will need a report highlighting which, if any, of the
//  the establishments and workers will be deleted.
// Only generate this validation difference report, if there are no errors.
const processDifferenceReport = (primaryEstablishmentId, onloadEntities, currentEntities) => {
  const newEntities = [];
  const updatedEntities = [];
  const deletedEntities = [];

  if (!onloadEntities || !Array.isArray(onloadEntities)) {
    console.error('processDifferenceReport: onload entities unexpected');
  }
  if (!currentEntities || !Array.isArray(currentEntities)) {
    console.error('processDifferenceReport: current entities unexpected');
  }

  // determine new and updated establishments, by referencing the onload set against the current set
  onloadEntities.forEach((thisOnloadEstablishment) => {
    // find a match for this establishment
    const foundCurrentEstablishment = currentEntities.find(
      (thisCurrentEstablishment) => thisCurrentEstablishment.key === thisOnloadEstablishment.key,
    );

    if (foundCurrentEstablishment) {
      // for updated establishments, need to cross check the set of onload and current workers to identify the new, updated and deleted workers
      const currentWorkers = foundCurrentEstablishment.associatedWorkers;
      const onloadWorkers = thisOnloadEstablishment.associatedWorkers;
      const newWorkers = [];
      const updatedWorkers = [];
      const deletedWorkers = [];

      // find new/updated/deleted workers
      onloadWorkers.forEach((thisOnloadWorker) => {
        const foundWorker = currentWorkers.find((thisCurrentWorker) => thisCurrentWorker === thisOnloadWorker);

        if (foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(foundWorker);
          const theOnloadWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);

          // note - even though a worker has been found - and therefore it is obvious to update it
          // it may be marked for deletion
          if (theOnloadWorker.status === 'DELETE') {
            deletedWorkers.push({
              key: thisOnloadWorker,
              name: theWorker.nameOrId,
              localId: theWorker.localIdentifier,
              status: theOnloadWorker.status,
            });
          } else {
            updatedWorkers.push({
              key: thisOnloadWorker,
              name: theWorker.nameOrId,
              localId: theWorker.localIdentifier,
              status: theOnloadWorker.status,
            });
          }
        } else {
          const theWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);
          newWorkers.push({
            key: thisOnloadWorker,
            name: theWorker.nameOrId,
            localId: theWorker.localIdentifier,
            status: theWorker.status,
          });
        }
      });

      // find deleted workers
      currentWorkers.forEach((thisCurrentWorker) => {
        const foundWorker = onloadWorkers.find((thisOnloadWorker) => thisCurrentWorker === thisOnloadWorker);

        if (!foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(thisCurrentWorker);
          deletedWorkers.push({
            key: thisCurrentWorker,
            name: theWorker.nameOrId,
            localId: theWorker.localIdentifier,
            status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight this has been automatically detected
          });
        }
      });

      // even though the establishment has found, it is obvious that it will be updated. But it could
      //  instead be marked for deletion
      if (thisOnloadEstablishment.status === 'DELETE') {
        // now, when deleting an establishment, all the workers are also deleted, regardless of their declared status
        const revisedSetOfDeletedWorkers = [...newWorkers, ...updatedWorkers, ...deletedWorkers];
        deletedEntities.push({
          key: thisOnloadEstablishment.key,
          name: thisOnloadEstablishment.name,
          localId: thisOnloadEstablishment.localIdentifier,
          status: thisOnloadEstablishment.status,
          workers: {
            deleted: revisedSetOfDeletedWorkers,
          },
        });
      } else {
        updatedEntities.push({
          key: thisOnloadEstablishment.key,
          name: thisOnloadEstablishment.name,
          localId: thisOnloadEstablishment.localIdentifier,
          status: thisOnloadEstablishment.status,
          workers: {
            new: newWorkers,
            updated: updatedWorkers,
            deleted: deletedWorkers,
          },
        });
      }
    } else {
      newEntities.push({
        key: thisOnloadEstablishment.key,
        name: thisOnloadEstablishment.name,
        localId: thisOnloadEstablishment.localIdentifier,
        status: thisOnloadEstablishment.status,
      });
    }
  });

  // determine the delete establishments, by reference the current set against the onload set
  currentEntities.forEach((thisCurrentEstablishment) => {
    if (thisCurrentEstablishment.id !== primaryEstablishmentId) {
      // ignore those establishments that the primary does not own
      if (thisCurrentEstablishment.parentUid && thisCurrentEstablishment.dataOwner === 'Parent') {
        // find a match for this establishment
        const foundOnloadEstablishment = onloadEntities.find(
          (thisOnloadEstablishment) => thisCurrentEstablishment.key === thisOnloadEstablishment.key,
        );

        // cannot delete self
        if (!foundOnloadEstablishment) {
          // when delete an establishment, we're deleting all workers too
          const currentWorkers = thisCurrentEstablishment.associatedWorkers;
          const deletedWorkers = [];

          currentWorkers.forEach((thisCurrentWorker) => {
            const thisWorker = thisCurrentEstablishment.theWorker(thisCurrentWorker);
            deletedWorkers.push({
              key: thisCurrentWorker,
              name: thisWorker.nameOrId,
              localId: thisWorker.localIdentifier,
              status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight
              // this has been automatically detected
            });
          });

          deletedEntities.push({
            key: thisCurrentEstablishment.key,
            name: thisCurrentEstablishment.name,
            localId: thisCurrentEstablishment.localIdentifier,
            status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight
            // this has been automatically detected
            workers: {
              deleted: deletedWorkers,
            },
          });
        }
      }
    } else {
      // TODO
      // need to raise a validation error as a result of trying to delete self
    }
  });

  // return validation difference report
  return {
    new: newEntities,
    updated: updatedEntities,
    deleted: deletedEntities,
  };
};

module.exports = {
  processDifferenceReport,
};
