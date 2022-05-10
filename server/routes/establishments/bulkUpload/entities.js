'use strict';

const { Establishment } = require('../../../models/classes/establishment');
const { User } = require('../../../models/classes/user');
const { downloadContent } = require('./s3');

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
// the "onlyMine" parameter is used to remove those subsidiary establishments where the parent is not the owner
const restoreExistingEntities = async (
  loggedInUsername,
  primaryEstablishmentId,
  isParent,
  assocationLevel = 1,
  onlyMine = false,
) => {
  try {
    const completionBulkUploadStatus = 'COMPLETE';
    const thisUser = new User(primaryEstablishmentId);
    await thisUser.restore(null, loggedInUsername, false);

    // gets a list of "my establishments", which if a parent, includes all known subsidaries too, and this "parent's" access permissions to those subsidaries
    const myEstablishments = await thisUser.myEstablishments(isParent, null);

    // having got this list of establishments, now need to fully restore each establishment as entities.
    //  using an object adding entities by a known key to make lookup comparisions easier.
    const currentEntities = [];
    const restoreEntityPromises = [];

    // first add the primary establishment entity
    const primaryEstablishment = new Establishment(loggedInUsername, completionBulkUploadStatus);
    currentEntities.push(primaryEstablishment);

    restoreEntityPromises.push(
      primaryEstablishment.restore(myEstablishments.primary.uid, false, true, assocationLevel).then((data) => {
        return data;
      }),
    );

    if (
      myEstablishments.subsidaries &&
      myEstablishments.subsidaries.establishments &&
      Array.isArray(myEstablishments.subsidaries.establishments)
    ) {
      myEstablishments.subsidaries.establishments = myEstablishments.subsidaries.establishments.filter(
        (est) => est.ustatus !== 'PENDING',
      );
      myEstablishments.subsidaries.establishments.forEach((thisSubsidairy) => {
        if (!onlyMine || (onlyMine && thisSubsidairy.dataOwner === 'Parent')) {
          const newSub = new Establishment(loggedInUsername, completionBulkUploadStatus);

          currentEntities.push(newSub);

          restoreEntityPromises.push(
            newSub.restore(thisSubsidairy.uid, false, true, assocationLevel).then((data) => {
              return data;
            }),
          );
        }
      });
    }

    await Promise.all(restoreEntityPromises);

    return currentEntities;
  } catch (err) {
    console.error('/restoreExistingEntities: ERR: ', err.message);
    throw err;
  }
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
const restoreOnloadEntities = async (loggedInUsername, primaryEstablishmentId) => {
  try {
    // the result of validation is to make available an S3 object outlining ALL entities ready to be uploaded
    const allEntitiesKey = `${primaryEstablishmentId}/intermediary/all.entities.json`;

    const onLoadEntitiesJSON = await downloadContent(allEntitiesKey).then((myFile) => {
      return myFile;
    });

    const onLoadEntities = JSON.parse(onLoadEntitiesJSON.data);

    // now create/load establishment entities from each of the establishments, including all associated entities (full depth including training/quals)
    const onLoadEstablishments = [];
    const onloadPromises = [];
    if (onLoadEntities && Array.isArray(onLoadEntities)) {
      onLoadEntities.forEach((thisEntity) => {
        const newOnloadEstablishment = new Establishment(loggedInUsername);
        onLoadEstablishments.push(newOnloadEstablishment);

        newOnloadEstablishment.initialise(
          thisEntity.address1,
          thisEntity.address2,
          thisEntity.address3,
          thisEntity.town,
          thisEntity.county,
          thisEntity.locationId,
          thisEntity.provId,
          thisEntity.postcode,
          thisEntity.isRegulated,
        );
        onloadPromises.push(
          newOnloadEstablishment.load(thisEntity, true).then((data) => {
            return data;
          }),
        );
      });
    }
    // wait here for the loading of all establishments from entities to complete
    await Promise.all(onloadPromises);

    return onLoadEstablishments;
  } catch (err) {
    console.error('/restoreExistingEntities: ERR: ', err.message);
    throw err;
  }
};

module.exports = {
  restoreExistingEntities,
  restoreOnloadEntities,
};
