// this is a singleton used to calculate the overal WDF Eligiblity for an establishment
//  it also calculates the effective date
const WdfUtils = require('../../utils/wdfEligibilityDate');
const models = require('../../models');

class WdfCalculator {
  constructor() {
    // initialises with the calculated effective date being this fiscal year
    this._effectiveDate = WdfUtils.wdfEligibilityDate();
  }

  get effectiveDate() {
    return this._effectiveDate;
  }

  get effectiveTime() {
    return this._effectiveDate.getTime();
  }

  // overrides the effective date
  set effectiveDate(effectiveFrom) {
    if (effectiveFrom === null) {
      // resettting the effective date to calculated date from fiscal year
      this._effectiveDate = WdfUtils.wdfEligibilityDate();
    } else {
      this._effectiveDate = effectiveFrom;
    }
  }

  // recalculates an establishment's WDF eligibility
  //   - this method is called internally - not direct from API, hence no user constraint in the find
  async calculate(savedBy, establishmentID, establishmentUID=null, externalTransaction=null) {
    console.log("WA DEBUG - recalculating Overall WDF Eligbility for establishment having id/uid: ", establishmentID, establishmentUID);

    try {
      let thisEstablishment = null;
      
      if (establishmentUID) {
        thisEstablishment = await models.establishment.findOne({
          attributes: ['id', 'uid', 'lastWdfEligibility', 'overallWdfEligibility', 'NumberOfStaffValue', 'NumberOfStaffSavedAt'],
          where: {
            uid: establishmentUID
          },
          transaction: externalTransaction
        });
      } else {
        thisEstablishment = await models.establishment.findOne({
          attributes: ['id', 'uid', 'lastWdfEligibility', 'overallWdfEligibility', 'NumberOfStaffValue', 'NumberOfStaffSavedAt'],
          where: {
            id: establishmentID
          },
          transaction: externalTransaction
        });
      }

      if (thisEstablishment && thisEstablishment.id) {
        // it's only necessary to recalculate the overal eligibiltiy if this Establishment's Overall Eligibility is not true
        if (thisEstablishment.overallWdfEligibility &&
            thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime) {
          // already eligibile
          console.log("WA DEBUG - already eligible")
          return;
        }

        console.log("WA DEBUG - not yet eligible")
        // the establishment must be eligible for the Overall WDF to be eligible
        if (thisEstablishment.lastWdfEligibility === null |
            thisEstablishment.lastWdfEligibility.getTime() < this.effectiveTime) {
          // this establishment fails overal eligibility
          return;
        }

        // the establishment must have at least one declared worker record
        // TODO - confirm if we need to ensure the number of staff has been updated since the effective date
        console.log("WA DEBUG - establishment is eligible")
        if (thisEstablishment.NumberOfStaffValue < 1) {
          return;
        }

        // all active workers for this establishment
        console.log("WA DEBUG - establishment has at least one worker")
        const theseWorkers = await models.worker.findAll({
          attributes: ['id', 'uid', 'lastWdfEligibility'],
          where: {
            establishmentFk: thisEstablishment.id,
            archived: false
          },
          transaction: externalTransaction
        });

        // the number of active worker records must be the same as the declared Establishment staff
        console.log(`WA DEBUG - Establishment has #${theseWorkers.length} workers`)
        if (!(theseWorkers && Array.isArray(theseWorkers) && theseWorkers.length === thisEstablishment.NumberOfStaffValue)) {
          return;
        }

        // at least 90% of all current workers must be eligible
        const allEligibleWorkers = theseWorkers.filter(thisWorker => thisWorker.lastWdfEligibility ? thisWorker.lastWdfEligibility.getTime() > this.effectiveTime : false);
        console.log(`WA DEBUG - establishment has #${allEligibleWorkers.length} eligible workers`)
        const weightedStaffEligibility = (allEligibleWorkers.length / theseWorkers.length);
        console.log(`WA DEBUG - establishment has ${weightedStaffEligibility*100}% eligible workers`)
        if (weightedStaffEligibility < 0.9) {
          return;
        }

        // update establishment's Overall WDF Eligibility and create audit event (within a transaction)
        await models.sequelize.transaction(async t => {
          const thisTransaction = externalTransaction ? externalTransaction : t;
          const updatedTimestamp = new Date();

          const updateDocument = {
            updated: updatedTimestamp,
            updatedBy: savedBy,
            overallWdfEligibility: updatedTimestamp,
          };
          let [updatedRecordCount, updatedRows] = await models.establishment.update(
                    updateDocument,
                    {
                        returning: true,
                        where: {
                          id: thisEstablishment.id
                        },
                        attributes: ['id', 'updated'],
                        transaction: thisTransaction,
                    });

          if (updatedRecordCount === 1) {
            const updatedRecord = updatedRows[0].get({plain: true});
            const auditEvents = [
              {
                establishmentFk: updatedRecord.EstablishmentID,
                username: savedBy,
                type: 'overalWdfEligible'
              },
              {
                establishmentFk: updatedRecord.EstablishmentID,
                username: savedBy,
                type: 'updated'
              }
            ];
            await models.establishmentAudit.bulkCreate(auditEvents, {transaction: thisTransaction});
          }
        });

        // TODO - post to SNS topic

      } else {
        console.error('WdfCalculator::calculate - Failed to find establishment having id/uid: ', establishmentID, establishmentUID);
      }
      
    } catch (err) {
      console.error('WdfCalculator::calculate - Failed to fetch establishment/workers: ', err);
    }

  }

  // reports on WDF Eligibility for the given Establishment
  async report(establishmentID, establishmentUID) {
    // TODO
    console.log("WA DEBUG - recalculating Overall WDF Eligbility for establishment having id/uid: ", establishmentID, establishmentUID);
  }

}

const THE_WDF_CALCULATOR = new WdfCalculator();
console.log("WA DEBUG - created Wdf Calculator singleton - effective date: ", THE_WDF_CALCULATOR.effectiveDate);

exports.WdfCalculator = THE_WDF_CALCULATOR;