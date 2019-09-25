// this is a singleton used to calculate the overal WDF Eligiblity for an establishment
//  it also calculates the effective date
const WdfUtils = require('../../utils/wdfEligibilityDate');
const models = require('../../models');

const config = require('../../config/config');

class WdfCalculator {
  get WORKER_ADD () { return 1000; }
  get WORKER_UPDATE () { return 1001; }
  get WORKER_DELETE () { return 1002; }

  get ESTABLISHMENT_ADD () { return 2000; }
  get ESTABLISHMENT_UPDATE () { return 2001; }
  get ESTABLISHMENT_DELETE () { return 2002; }

  get BULK_UPLOAD () { return 3000; }
  get REPORT () { return 4000; }
  get RECALC () { return 5000; }

  get ALREADY_ELIGIBLE () { return 5000; }
  get NOW_ELIGIBLE () { return 5001; }
  get NOT_ELIGIBLE () { return 5002; }

  wdfImpactToString (wdfImpact) {
    switch (wdfImpact) {
      case 1000:
        return 'Worker Add WDF Impact';

      case 1001:
        return 'Worker Update WDF Impact';

      case 1002:
        return 'Worker Delete WDF Impact';

      case 2000:
        return 'Establishment Add WDF Impact';

      case 2001:
        return 'Establishment Update WDF Impact';

      case 2002:
        return 'Establishment Delete WDF Impact';

      case 3000:
        return 'Bulk Upload WDF Impact';

      case 4000:
        return 'Report';

      case 5000:
        return 'Recalc';
    }

    return null;
  }

  wdfImpactToFields (wdfImpact) {
    // we now always calculate the staff and establishment eligibility
    let calculateOverall = false, calculateStaff = true, calculateEstablishment = true;

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

    return {
      calculateOverall,
      calculateStaff,
      calculateEstablishment
    };
  }

  wdfEligibleReponseToString (wdfEligible) {
    switch (wdfEligible) {
      case 5000:
        return 'Already Eligible';

      case 5001:
        return 'Now Eligible';

      case 5002:
        return 'Not Eligible';
    }

    return null;
  }

  get effectiveDate () {
    if (config.get('admin.overrideWdfEffectiveDate') === false) {
      return WdfUtils.wdfEligibilityDate(); // return the most recent previous 1st of April
    } else {
      return config.get('admin.overrideWdfEffectiveDate');
    }
  }

  // overrides the effective date
  set effectiveDate (effectiveFrom) {
    if (effectiveFrom === null) {
      // resettting the effective date to calculated date from fiscal year
      config.set('admin.overrideWdfEffectiveDate', false);
    } else {
      config.set('admin.overrideWdfEffectiveDate', effectiveFrom);
    }
  }

  get effectiveTime () {
    return this.effectiveDate.getTime();
  }

  async _overallWdfEligibility ({
    thisEstablishment,
    calculatedStaffEligible,
    calculatedEstablishmentEligible,
    readOnly,
    savedBy,
    thisTransaction,
    reasons
  }) {
    // console.log(`WA DEBUG - recalculating overal WDF eligibility for establishment (${establishment.id})`);
    if (thisEstablishment.overallWdfEligibility && thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime) {
      // already eligibile
      return this.ALREADY_ELIGIBLE;
    }

    if (!(calculatedStaffEligible !== this.NOT_ELIGIBLE && calculatedEstablishmentEligible !== this.NOT_ELIGIBLE)) {
      reasons.push({
        overall: {
          message: 'Establishment and/or Staff not eligible',
          code: 1
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // get this far is now eligible
    if (!readOnly) {
      await thisEstablishment.update(
        {
          overallWdfEligibility: new Date()
        },
        {
          transaction: thisTransaction
        }
      );

      // audit this activity
      await models.establishmentAudit.create(
        {
          establishmentFk: thisEstablishment.id,
          username: savedBy,
          type: 'overalWdfEligible'
        },
        {
          transaction: thisTransaction
        }
      );
    }

    return this.NOW_ELIGIBLE;
  }

  async _establishmentWdfEligibility ({
    thisEstablishment,
    reasons
  }) {
    // console.log(`WA DEBUG - recalculating establishment WDF eligibility for establishment (${establishment.id})`);
    if (thisEstablishment.overallWdfEligibility && thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime) {
      // already eligibile
      return this.ALREADY_ELIGIBLE;
    }

    // the number of active worker records must be the same as the declared Establishment staff
    // console.log(`WA DEBUG - Establishment has #${thisEstablishment.workerCount} workers`)
    if (parseInt(thisEstablishment.workersCount || 0, 10) !== thisEstablishment.NumberOfStaffValue) {
      reasons.push({
        establishment: {
          message: 'Number of Staff not equal to #staff',
          code: 10
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // with number of staff/#workers matching, the establishment itself must be eligible
    if (!(thisEstablishment.lastWdfEligibility && thisEstablishment.lastWdfEligibility.getTime() > this.effectiveTime)) {
      reasons.push({
        establishment: {
          message: 'Workplace properties not all eligible',
          code: 11
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // gets this far if now eligible - but do not update establishment WDF eligibility  - no tracking

    return this.NOW_ELIGIBLE;
  }

  async _staffWdfEligibility ({
    thisEstablishment,
    reasons
  }) {
    const workersCount = parseInt(thisEstablishment.workersCount || 0, 10);
    const eligibleWorkersCount = parseInt(thisEstablishment.eligibleWorkersCount || 0, 10);

    // console.log(`WA DEBUG - recalculating staff WDF eligibility for establishment (${establishment.id})`);
    if (thisEstablishment.overallWdfEligibility && thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime) {
      // already eligibile
      return this.ALREADY_ELIGIBLE;
    }

    if (workersCount === 0) {
      reasons.push({
        staff: {
          message: 'Must have at least one worker',
          code: 100
        }
      });

      return this.NOT_ELIGIBLE;
    }

    // at least 90% of all current workers must be eligible

    const weightedStaffEligibility = workersCount > 0 ? eligibleWorkersCount / workersCount : 0;

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

    return this.NOW_ELIGIBLE;
  }

  // calculate eligability for a establishment model provided as a paremeter
  async calculateData ({
    thisEstablishment,
    calculateOverall,
    calculateStaff,
    calculateEstablishment,
    readOnly = false,
    savedBy,
    thisTransaction
  }) {
    const wdf = {};
    const reasons = [];

    // staff and establishment eligibility must be calculated/recalculated prior to overall, because any changes to the former, affects the latter
    const calculatedStaffEligible = calculateStaff ? await this._staffWdfEligibility({
      thisEstablishment,
      reasons
    }) : null;

    const calculatedEstablishmentEligible = calculateEstablishment ? await this._establishmentWdfEligibility({
      thisEstablishment,
      reasons
    }) : null;

    // note - in each of the above calculate stages (staff/establishment), the "thisEstablishment" is updated
    //  to reflect the latest staff/establishment values
    if (calculateOverall) {
      this._overallWdfEligibility({
        thisEstablishment,
        calculatedStaffEligible,
        calculatedEstablishmentEligible,
        readOnly,
        savedBy,
        thisTransaction,
        reasons
      });
    }

    // now prep the return object - predominantly will be used by the report
    if (thisEstablishment.overallWdfEligibility) {
      wdf.overallWdfEligibility = thisEstablishment.overallWdfEligibility;
      wdf.overall = thisEstablishment.overallWdfEligibility.getTime() > this.effectiveTime;
    } else {
      wdf.overall = false;
    }

    if (wdf.overall) {
      wdf.staff = true;
      wdf.workplace = true;
    } else {
      wdf.staff = calculatedStaffEligible && calculatedStaffEligible !== this.NOT_ELIGIBLE;
      wdf.workplace = calculatedEstablishmentEligible && calculatedEstablishmentEligible !== this.NOT_ELIGIBLE;
    }

    wdf.reasons = reasons.length > 0 ? reasons : undefined;

    return wdf;
  }

  // recalculates an establishment's WDF eligibility
  //   - this method is called internally - not direct from API
  // returns true on success and false on error
  async calculate (savedBy, establishmentID, establishmentUID = null, externalTransaction = null, wdfImpact, readOnly) {
    let wdf = false;
    const { calculateOverall, calculateStaff, calculateEstablishment } = this.wdfImpactToFields(wdfImpact);

    console.log(
      'WA DEBUG - recalculating Overall WDF Eligbility for establishment having id/uid/wdf impact and triggers (staff/establishment/overal): ',
      establishmentID,
      establishmentUID,
      this.wdfImpactToString(wdfImpact),
      calculateStaff,
      calculateEstablishment,
      calculateOverall
    );

    try {
      await models.sequelize.transaction(async t => {
        const where = establishmentUID ? { uid: establishmentUID } : { id: establishmentID };

        let thisEstablishment;

        if (calculateStaff || calculateEstablishment) {
          // get worker counts as part of the query
          thisEstablishment = await models.establishment.findOne({
            attributes: [
              'id',
              'uid',
              'lastWdfEligibility',
              'overallWdfEligibility',
              'staffWdfEligibility',
              'establishmentWdfEligibility',
              'NumberOfStaffValue',
              [models.sequelize.fn("COUNT", models.sequelize.col('"workers"."ID"')), "workerCount"],
              [models.sequelize.fn(
                  "SUM",
                  models.sequelize.literal(`CASE WHEN "workers"."LastWdfEligibility" > '${this  .effectiveDate.toISOString()}' THEN 1 ELSE 0 END`)
                ),
                "eligibleWorkersCount"]
            ],
            include: [
              {
                model: models.worker, 
                as: 'workers',
                attributes: []
              }
            ],
            where,
            group: [
              'establishment.EstablishmentID',
              'uid',
              'lastWdfEligibility',
              'overallWdfEligibility',
              'staffWdfEligibility',
              'establishmentWdfEligibility',
              'NumberOfStaffValue',
            ],
            transaction: externalTransaction
          });
        } else {
          thisEstablishment = await models.establishment.findOne({
            attributes: [
              'id',
              'uid',
              'lastWdfEligibility',
              'overallWdfEligibility',
              'staffWdfEligibility',
              'establishmentWdfEligibility',
              'NumberOfStaffValue'
            ],
            where,
            transaction: externalTransaction
          });
        }

        if (thisEstablishment && thisEstablishment.id) {
          wdf = this.calculateData({
            thisEstablishment,
            calculateOverall,
            calculateStaff,
            calculateEstablishment,
            readOnly,
            savedBy,
            thisTransaction: externalTransaction || t
          });
        }
      });

      if (wdf) {
        console.log('WA DEBUG - WDF: ', wdf, wdf.reasons ? wdf.reasons : null);
      } else {
        console.error('WdfCalculator::calculate - Failed to find establishment having id/uid: ', establishmentID, establishmentUID);
      }
    } catch (err) {
      console.error('WdfCalculator::calculate - Failed to fetch establishment/workers: ', err);
    }

    return wdf;
  }

  // reports on WDF Eligibility for the given Establishment
  // returns the WDF for reporting on success and false on error
  async report (establishmentID, establishmentUID) {
    try {
      // run calculation - effectively as a simulation
      return this.calculate('', establishmentID, establishmentUID, null, this.REPORT, false);
    } catch (err) {
      console.error('WdfCalculator::report - failed to report on WDF : ', err);
      return false;
    }
  }
}

const THE_WDF_CALCULATOR = new WdfCalculator();

exports.WdfCalculator = THE_WDF_CALCULATOR;
