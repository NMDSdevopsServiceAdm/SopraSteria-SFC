// this is a singleton used to calculate the overal WDF Eligiblity for an establishment
//  it also calculates the effective date
const WdfUtils = require('../../utils/wdfEligibilityDate');
const models = require('../../models');

const config = require('../../config/config');

class WdfCalculator {
  constructor() {
    // initialises with the calculated effective date being this fiscal year
    this._effectiveDate = WdfUtils.wdfEligibilityDate();
  }

  get WORKER_ADD() { return 1000; }
  get WORKER_UPDATE() { return 1001; }
  get WORKER_DELETE() { return 1002; }

  get ESTABLISHMENT_ADD() { return 2000; }
  get ESTABLISHMENT_UPDATE() { return 2001; }
  get ESTABLISHMENT_DELETE() { return 2002; }

  get BULK_UPLOAD() { return 3000; }
  get REPORT() { return 4000; }
  get RECALC() { return 5000; }

  get ALREADY_ELIGIBLE() { return 5000; }
  get NOW_ELIGIBLE() { return 5001; }
  get NOT_ELIGIBLE() { return 5002; }

  wdfImpactToString(wdfImpact) {
    let toString = null;

    switch (wdfImpact) {
      case 1000:
        toString = 'Worker Add WDF Impact';
        break;
      case 1001:
        toString = 'Worker Update WDF Impact';
        break;
      case 1002:
        toString = 'Worker Delete WDF Impact';
        break;
      case 2000:
        toString = 'Establishment Add WDF Impact';
        break;
      case 2001:
        toString = 'Establishment Update WDF Impact';
        break;
      case 2002:
        toString = 'Establishment Delete WDF Impact';
        break;
      case 3000:
        toString = 'Bulk Upload WDF Impact'
        break;
      case 4000:
        toString = 'Report'
        break;
      case 5000:
        toString = 'Recalc'
        break;
    }

    return toString;
  }

  wdfEligibleReponseToString(wdfEligible)  {
    let toString = null;
    switch (wdfEligible) {
      case 5000:
        toString = 'Already Eligible';
        break;
      case 5001:
        toString = 'Now Eligible';
        break;
      case 5002:
        toString = 'Not Eligible';
        break;
    }

    return toString;
  }

  get effectiveDate() {
    //return new Date('14 Aug 2019 13:47:00 GMT');
    if (config.get('admin.overrideWdfEffectiveDate') === false) {
      return WdfUtils.wdfEligibilityDate();
    } else {
      return config.get('admin.overrideWdfEffectiveDate');
    }
  }

  get effectiveTime() {
    return this.effectiveDate.getTime();
  }

  // overrides the effective date
  set effectiveDate(effectiveFrom) {
    if (effectiveFrom === null) {
      // resettting the effective date to calculated date from fiscal year
      config.set('admin.overrideWdfEffectiveDate', false);
    } else {
      config.set('admin.overrideWdfEffectiveDate', effectiveFrom);
    }
  }

  async _overallWdfEligibility(savedBy, establishment, externalTransaction, readonly, reasons, calculatedStaffEligible, calculatedEstablishmentEligible) {
    //console.log(`WA DEBUG - recalculating overal WDF eligibility for establishment (${establishment.id})`);
    if (establishment.overallWdfEligibility && establishment.overallWdfEligibility.getTime() > this.effectiveTime) {
      // already eligibile
      return this.ALREADY_ELIGIBLE;
    }

    if (!(calculatedStaffEligible != this.NOT_ELIGIBLE && calculatedEstablishmentEligible != this.NOT_ELIGIBLE)) {
      reasons.push({
        overall: {
          message: 'Establishment and/or Staff not eligible',
          code: 1
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // get this far is now eligible
    if (!readonly) {
      await establishment.update(
        {
          overallWdfEligibility: new Date(),
        },
        {
          transaction: externalTransaction
        }
      );

      // audit this activity
      await models.establishmentAudit.create(
        {
          establishmentFk: establishment.id,
          username: savedBy,
          type: 'overalWdfEligible'
        },
        {transaction: externalTransaction}
      );
    }

    return this.NOW_ELIGIBLE;
  }

  async _establishmentWdfEligibility(savedBy, establishment, workers, externalTransaction, readonly, reasons) {
    // console.log(`WA DEBUG - recalculating establishment WDF eligibility for establishment (${establishment.id})`);
    if (establishment.overallWdfEligibility && establishment.overallWdfEligibility.getTime() > this.effectiveTime) {
      // already eligibile
      return this.ALREADY_ELIGIBLE;
    }

    // the number of active worker records must be the same as the declared Establishment staff
    // console.log(`WA DEBUG - Establishment has #${workers.length} workers`)
    if (!(workers && Array.isArray(workers) && workers.length === establishment.NumberOfStaffValue)) {
      reasons.push({
        establishment: {
          message: 'Number of Staff not equal to #staff',
          code: 10
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // with number of staff/#workers matching, the establishment itself must be eligible
    if (!(establishment.lastWdfEligibility && establishment.lastWdfEligibility.getTime() > this.effectiveTime)) {
      reasons.push({
        establishment: {
          message: 'Workplace properties not all eligible',
          code: 11
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // gets this far if now eligble - but do not update establishment WDF eligibility  - no tracking
    if (false) {
      await establishment.update(
        {
          establishmentWdfEligibility: new Date()
        },
        {
          transaction: externalTransaction
        }
      );

      // audit this activity
      await models.establishmentAudit.create(
        {
          establishmentFk: establishment.id,
          username: savedBy,
          type: 'establishmentWdfEligible'
        },
        {transaction: externalTransaction}
      );
    }

    console.log("WA DEBUG - WDF est - got here")

    return this.NOW_ELIGIBLE;
  }

  async _staffWdfEligibility(savedBy, establishment, workers, externalTransaction, readonly, reasons) {
    //console.log(`WA DEBUG - recalculating staff WDF eligibility for establishment (${establishment.id})`);
    if (establishment.overallWdfEligibility && establishment.overallWdfEligibility.getTime() > this.effectiveTime) {
      // already eligibile
      return this.ALREADY_ELIGIBLE;
    }

    if (!(workers && Array.isArray(workers) && workers.length >= 1)) {
      reasons.push({
        staff: {
          message: 'Must have at least one worker',
          code: 100
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // at least 90% of all current workers must be eligible
    const allEligibleWorkers = workers && Array.isArray(workers) ?
            workers.filter(thisWorker => thisWorker.lastWdfEligibility ? thisWorker.lastWdfEligibility.getTime() > this.effectiveTime : false) :
            false;
    const weightedStaffEligibility = (allEligibleWorkers.length / workers.length);
    // console.log(`WA DEBUG - establishment has #${workers.length} workers having #${allEligibleWorkers.length} eligible workers: ${weightedStaffEligibility*100}%`)
    if (weightedStaffEligibility < 0.9) {
      reasons.push({
        staff: {
          message: 'Less than 90% of staff records are WDF eligible',
          code: 101
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // gets this far if now eligble - but do not update establishment WDF eligibility  - no tracking
    if (false) {
      await establishment.update(
        {
          staffWdfEligibility: new Date()
        },
        {
          transaction: externalTransaction
        }
      );

      // audit this activity
      await models.establishmentAudit.create(
        {
          establishmentFk: establishment.id,
          username: savedBy,
          type: 'staffWdfEligible'
        },
        {transaction: externalTransaction}
      );
    }

    return this.NOW_ELIGIBLE;
  }

  // recalculates an establishment's WDF eligibility
  //   - this method is called internally - not direct from API
  // returns true on success and false on error
  async calculate(savedBy, establishmentID, establishmentUID=null, externalTransaction=null, wdfImpact, readonly) {

    // we now always calculate the staff and establishment eligibility
    let calculateOverall = false, calculateStaff = true, calculateEstablishment = true;
    const wdf = {};

    switch (wdfImpact) {
      case 1000:
        // add worker
        calculateOverall = true;
        calculateEstablishment = true;
        calculateStaff = true;
        break;
      case 1001:
        // update worker
        calculateOverall = true;
        calculateStaff = true;
        break;
      case 1002:
        // delete worker
        calculateOverall = true;
        calculateEstablishment = true;
        calculateStaff = true;
        break;
      case 2000:
        // add establishment
        break;
      case 2001:
        // update establishment
        calculateOverall = true;
        calculateEstablishment = true;
        break;
      case 2002:
        // delete establishment
        break;
      case 3000:
        // bulk upload
        calculateOverall = true;
        calculateEstablishment = true;
        calculateStaff = true;
        break;
      case 4000:
        // report
        calculateOverall = true;
        calculateEstablishment = true;
        calculateStaff = true;
        break;
      case 5000:
        // recalc
        calculateOverall = true;
        calculateEstablishment = true;
        calculateStaff = true;
        break;
    }

    console.log("WA DEBUG - recalculating Overall WDF Eligbility for establishment having id/uid/wdf impact and triggers (staff/establishment/overal): ", establishmentID, establishmentUID, this.wdfImpactToString(wdfImpact), calculateStaff, calculateEstablishment, calculateOverall);

    try {
      let thisEstablishment = null;

      let foundEstablishment = false;
      await models.sequelize.transaction(async t => {
        const thisTransaction = externalTransaction ? externalTransaction : t;

        if (establishmentUID) {
          thisEstablishment = await models.establishment.findOne({
            attributes: ['id', 'uid', 'lastWdfEligibility', 'overallWdfEligibility', 'staffWdfEligibility', 'establishmentWdfEligibility', 'NumberOfStaffValue', 'NumberOfStaffSavedAt'],
            where: {
              uid: establishmentUID
            },
            transaction: externalTransaction
          });
        } else {
          thisEstablishment = await models.establishment.findOne({
            attributes: ['id', 'uid', 'lastWdfEligibility', 'overallWdfEligibility', 'staffWdfEligibility', 'establishmentWdfEligibility', 'NumberOfStaffValue', 'NumberOfStaffSavedAt'],
            where: {
              id: establishmentID
            },
            transaction: externalTransaction
          });
        }

        // if calculating the staff or establishment eligibility, then need the set of workers too
        let workers = null;
        if (calculateStaff || calculateEstablishment) {
          // all active workers for this establishment
          workers = await models.worker.findAll({
            attributes: ['id', 'uid', 'lastWdfEligibility'],
            where: {
              establishmentFk: thisEstablishment.id,
              archived: false
            },
            transaction: externalTransaction
          });
        }

        if (thisEstablishment && thisEstablishment.id) {
          foundEstablishment = true;
          const reasons = [];

          // staff and establishment eligibility must be calculated/recalculated prior to overall, because any changes to the former, affects the latter
          let calculatedStaffEligible = null, calculatedEstablishmentEligible=null;
          if (calculateStaff) {
            calculatedStaffEligible = await this._staffWdfEligibility(savedBy, thisEstablishment, workers, thisTransaction, readonly, reasons);
          }
          if (calculateEstablishment) {
            calculatedEstablishmentEligible = await this._establishmentWdfEligibility(savedBy, thisEstablishment, workers, thisTransaction, readonly, reasons);
          }

          // note - in each of the above calculate stages (staff/establishment), the "thisEstablishment" is updated
          //         to reflect the latest staff/establishment values
          if (calculateOverall) {
            const calculatedOverallEigible = await this._overallWdfEligibility(savedBy, thisEstablishment, thisTransaction, readonly, reasons, calculatedStaffEligible, calculatedEstablishmentEligible);
          }

          // now prep the return object - predominantly will be used by the report
          const overallIsEligbile = thisEstablishment.overallWdfEligibility && (thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime) ? true : false;

          wdf.staff = overallIsEligbile ? true : calculatedStaffEligible && calculatedStaffEligible !== this.NOT_ELIGIBLE ? true : false;
          // wdf.staffEligibility = thisEstablishment.staffWdfEligibility ? thisEstablishment.staffWdfEligibility : undefined;
          wdf.workplace = overallIsEligbile ? true : calculatedEstablishmentEligible && calculatedEstablishmentEligible !== this.NOT_ELIGIBLE ? true : false;
          // wdf.establishmentElibigility = thisEstablishment.establishmentWdfEligibility ? thisEstablishment.establishmentWdfEligibility : undefined;
          wdf.overall = thisEstablishment.overallWdfEligibility && (thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime) ? true : false;
          wdf.overallWdfEligibility = thisEstablishment.overallWdfEligibility ? thisEstablishment.overallWdfEligibility : undefined;
          wdf.reasons = reasons.length > 0 ? reasons : undefined;

        } else {
          // handle this error outside of the transaction, because otherwise we risk the danger of rolling back the whole transaction
        }
      });

      if (!foundEstablishment) {
        console.error('WdfCalculator::calculate - Failed to find establishment having id/uid: ', establishmentID, establishmentUID);
        return false;
      } else {
        console.log("WA DEBUG - WDF: ", wdf, wdf.reasons ? wdf.reasons : null);
        return wdf;
      }
    } catch (err) {
      console.error('WdfCalculator::calculate - Failed to fetch establishment/workers: ', err);
      return false;
    }

  }

  // reports on WDF Eligibility for the given Establishment
  // returns the WDF for reporting on success and false on error
  async report(establishmentID, establishmentUID) {
    try {
      // run calculation - effectively as a simulation
      const wdfReport = this.calculate('', establishmentID, establishmentUID, null, this.REPORT, false);
      return wdfReport;

    } catch (err) {
      console.error('WdfCalculator::report - failed to report on WDF : ', err);
      return false;
    }
  }
}

const THE_WDF_CALCULATOR = new WdfCalculator();

exports.WdfCalculator = THE_WDF_CALCULATOR;
