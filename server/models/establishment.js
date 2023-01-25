const { Op } = require('sequelize');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const Establishment = sequelize.define(
    'establishment',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"EstablishmentID"',
      },
      uid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: '"EstablishmentUID"',
      },
      ustatus: {
        type: DataTypes.ENUM,
        values: ['PENDING', 'IN PROGRESS', 'REJECTED'],
        allowNull: true,
        field: '"Status"',
      },
      address1: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address1"',
      },
      Address1SavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Address1SavedAt"',
      },
      Address1ChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Address1ChangedAt"',
      },
      Address1SavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address1SavedBy"',
      },
      Address1ChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address1ChangedBy"',
      },
      address2: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address2"',
      },
      Address2SavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Address2SavedAt"',
      },
      Address2ChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Address2ChangedAt"',
      },
      Address2SavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address2SavedBy"',
      },
      Address2ChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address2ChangedBy"',
      },
      address3: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address3"',
      },
      Address3SavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Address3SavedAt"',
      },
      Address3ChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Address3ChangedAt"',
      },
      Address3SavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address3SavedBy"',
      },
      Address3ChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Address3ChangedBy"',
      },
      town: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Town"',
      },
      TownSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"TownSavedAt"',
      },
      TownChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"TownChangedAt"',
      },
      TownSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"TownSavedBy"',
      },
      TownChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"TownChangedBy"',
      },
      county: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"County"',
      },
      CountySavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CountySavedAt"',
      },
      CountyChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CountyChangedAt"',
      },
      CountySavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CountySavedBy"',
      },
      CountyChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CountyChangedBy"',
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"LocationID"',
      },
      LocationIdSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LocationIdSavedAt"',
      },
      LocationIdChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LocationIdChangedAt"',
      },
      LocationIdSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LocationIdSavedBy"',
      },
      LocationIdChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LocationIdChangedBy"',
      },
      provId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"ProvID"',
      },
      postcode: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"PostCode"',
      },
      PostcodeSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"PostcodeSavedAt"',
      },
      PostcodeChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"PostcodeChangedAt"',
      },
      PostcodeSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PostcodeSavedBy"',
      },
      PostcodeChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PostcodeChangedBy"',
      },
      isRegulated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: '"IsRegulated"',
      },
      IsRegulatedSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"IsRegulatedSavedAt"',
      },
      IsRegulatedChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"IsRegulatedChangedAt"',
      },
      IsRegulatedSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"IsRegulatedSavedBy"',
      },
      IsRegulatedChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"IsRegulatedChangedBy"',
      },
      overallWdfEligibility: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OverallWdfEligibility"',
      },
      establishmentWdfEligibility: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EstablishmentWdfEligibility"',
      },
      staffWdfEligibility: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"StaffWdfEligibility"',
      },
      lastWdfEligibility: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LastWdfEligibility"',
      },
      isParent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
        field: '"IsParent"',
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"ParentID"',
      },
      parentUid: {
        type: DataTypes.UUID,
        allowNull: true,
        field: '"ParentUID"',
      },
      dataOwner: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Workplace', 'Parent'],
        field: '"DataOwner"',
        default: 'Workplace',
      },
      dataPermissions: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Workplace', 'Workplace and Staff', 'None'],
        field: '"DataPermissions"',
      },
      NameValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: '"NameValue"',
      },
      NameSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NameSavedAt"',
      },
      NameChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NameChangedAt"',
      },
      NameSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NameSavedBy"',
      },
      NameChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NameChangedBy"',
      },
      MainServiceFKValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"MainServiceFKValue"',
      },
      MainServiceFKSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainServiceFKSavedAt"',
      },
      MainServiceFKChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainServiceFKChangedAt"',
      },
      MainServiceFKSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MainServiceFKSavedBy"',
      },
      MainServiceFKChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MainServiceFKChangedBy"',
      },
      MainServiceFkOther: {
        type: DataTypes.TEXT,
        allowNull: true,
        primaryKey: false,
        field: '"MainServiceFkOther"',
      },
      EmployerTypeValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: [
          'Private Sector',
          'Voluntary / Charity',
          'Other',
          'Local Authority (generic/other)',
          'Local Authority (adult services)',
        ],
        field: '"EmployerTypeValue"',
      },
      EmployerTypeSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EmployerTypeSavedAt"',
      },
      EmployerTypeChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EmployerTypeChangedAt"',
      },
      EmployerTypeSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EmployerTypeSavedBy"',
      },
      EmployerTypeChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EmployerTypeChangedBy"',
      },
      EmployerTypeOther: {
        type: DataTypes.TEXT,
        allowNull: true,
        primaryKey: false,
        field: '"EmployerTypeOther"',
      },
      NumberOfStaffValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"NumberOfStaffValue"',
      },
      NumberOfStaffSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NumberOfStaffSavedAt"',
      },
      NumberOfStaffChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NumberOfStaffChangedAt"',
      },
      NumberOfStaffSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NumberOfStaffSavedBy"',
      },
      NumberOfStaffChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NumberOfStaffChangedBy"',
      },
      otherServicesValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        field: '"OtherServicesValue"',
        values: ['No', 'Yes'],
      },
      OtherServicesSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OtherServicesSavedAt"',
      },
      OtherServicesChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OtherServicesChangedAt"',
      },
      OtherServicesSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"OtherServicesSavedBy"',
      },
      OtherServicesChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"OtherServicesChangedBy"',
      },
      ServiceUsersSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ServiceUsersSavedAt"',
      },
      ServiceUsersChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ServiceUsersChangedAt"',
      },
      ServiceUsersSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ServiceUsersSavedBy"',
      },
      ServiceUsersChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ServiceUsersChangedBy"',
      },
      CapacityServicesSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CapacityServicesSavedAt"',
      },
      CapacityServicesChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CapacityServicesChangedAt"',
      },
      CapacityServicesSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CapacityServicesSavedBy"',
      },
      CapacityServicesChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CapacityServicesChangedBy"',
      },
      ShareDataSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ShareDataSavedAt"',
      },
      ShareDataChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ShareDataChangedAt"',
      },
      ShareDataSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ShareDataSavedBy"',
      },
      ShareDataChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ShareDataChangedBy"',
      },
      shareWithCQC: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"ShareDataWithCQC"',
      },
      shareWithLA: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"ShareDataWithLA"',
      },
      VacanciesValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['None', "Don't know", 'With Jobs'],
        field: '"VacanciesValue"',
      },
      VacanciesSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"VacanciesSavedAt"',
      },
      VacanciesChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"VacanciesChangedAt"',
      },
      VacanciesSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"VacanciesSavedBy"',
      },
      VacanciesChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"VacanciesChangedBy"',
      },
      StartersValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['None', "Don't know", 'With Jobs'],
        field: '"StartersValue"',
      },
      StartersSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"StartersSavedAt"',
      },
      StartersChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"StartersChangedAt"',
      },
      StartersSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"StartersSavedBy"',
      },
      StartersChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"StartersChangedBy"',
      },
      LeaversValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['None', "Don't know", 'With Jobs'],
        field: '"LeaversValue"',
      },
      LeaversSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LeaversSavedAt"',
      },
      LeaversChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LeaversChangedAt"',
      },
      LeaversSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LeaversSavedBy"',
      },
      LeaversChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LeaversChangedBy"',
      },
      LocalIdentifierValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true,
        field: '"LocalIdentifierValue"',
      },
      LocalIdentifierSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LocalIdentifierSavedAt"',
      },
      LocalIdentifierChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LocalIdentifierChangedAt"',
      },
      LocalIdentifierSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LocalIdentifierSavedBy"',
      },
      LocalIdentifierChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LocalIdentifierChangedBy"',
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: '"Archived"',
        defaultValue: false,
      },
      nmdsId: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"NmdsID"',
      },
      source: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Online', 'Bulk'],
        default: 'Online',
        field: '"DataSource"',
      },
      lastBulkUploaded: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LastBulkUploaded"',
      },
      dataOwnershipRequested: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DataOwnershipRequested"',
      },
      linkToParentRequested: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LinkToParentRequested"',
      },
      reasonsForLeaving: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ReasonsForLeaving"',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created',
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated',
      },
      updatedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'updatedby',
      },
      laReportLockHeld: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'LaReportLockHeld',
      },
      eightWeeksFromFirstLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'eightWeeksFromFirstLogin',
      },
      reviewer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Reviewer',
      },
      inReview: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'InReview',
      },
      showSharingPermissionsBanner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'ShowSharingPermissionsBanner',
      },
      expiresSoonAlertDate: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['90', '60', '30'],
        default: '90',
        field: 'ExpiresSoonAlertDate',
      },
      dataChangesLastUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'DataChangesLastUpdated',
      },
      isNationalOrg: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'IsNationalOrg',
      },
      peopleInterviewedInTheLastFourWeeks: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PeopleInterviewedInTheLastFourWeeks"',
      },
      moneySpentOnAdvertisingInTheLastFourWeeks: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MoneySpentOnAdvertisingInTheLastFourWeeks"',
      },
      doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes, always', 'Yes, very often', 'Yes, but not very often', 'No, never'],
        field: '"DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment"',
      },
      wouldYouAcceptCareCertificatesFromPreviousEmployment: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes, always', 'Yes, very often', 'Yes, but not very often', 'No, never'],
        field: '"WouldYouAcceptCareCertificatesFromPreviousEmployment"',
      },
      recruitmentJourneyExistingUserBanner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'RecruitmentJourneyExistingUserBanner',
      },
      showAddWorkplaceDetailsBanner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'ShowAddWorkplaceDetailsBanner',
      },
      careWorkersLeaveDaysPerYear: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'CareWorkersLeaveDaysPerYear',
      },
      careWorkersCashLoyaltyForFirstTwoYears: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'CareWorkersCashLoyaltyForFirstTwoYears',
      },
      pensionContribution: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: 'PensionContribution',
      },
      sickPay: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: 'SickPay',
      },
    },
    {
      defaultScope: {
        where: {
          archived: false,
        },
      },
      scopes: {
        noUstatus: {
          where: {
            ustatus: {
              [Op.is]: null,
            },
          },
        },
        noLocalIdentifier: {
          where: {
            LocalIdentifierValue: {
              [Op.is]: null,
            },
          },
        },
        parentAndChildWorkplaces: function (establishmentId) {
          return {
            where: {
              [Op.or]: [
                {
                  id: establishmentId,
                },
                {
                  parentId: establishmentId,
                  dataOwner: 'Parent',
                },
              ],
            },
          };
        },
        withEstablishmentId: function (establishmentId) {
          return {
            where: {
              id: establishmentId,
            },
          };
        },
      },
      tableName: '"Establishment"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  Establishment.addHook('afterUpdate', (record) => {
    const postcode = record.dataValues.PostCode;
    if (postcode) sequelize.models.postcodes.firstOrCreate(postcode);
  });

  Establishment.associate = (models) => {
    Establishment.belongsTo(models.establishment, {
      as: 'Parent',
      foreignKey: 'ParentID',
      targetKey: 'id',
    });
    Establishment.belongsTo(models.lastUpdatedEstablishmentsView, {
      as: 'LastUpdated',
      foreignKey: 'id',
      targetKey: 'id',
    });

    Establishment.hasMany(models.user, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'users',
    });
    Establishment.belongsTo(models.services, {
      foreignKey: 'MainServiceFKValue',
      targetKey: 'id',
      as: 'mainService',
    });
    Establishment.belongsToMany(models.services, {
      through: 'establishmentServices',
      foreignKey: 'establishmentId',
      targetKey: 'id',
      as: 'otherServices',
    });
    Establishment.belongsToMany(models.serviceUsers, {
      through: 'establishmentServiceUsers',
      foreignKey: 'establishmentId',
      targetKey: 'id',
      as: 'serviceUsers',
    });
    Establishment.hasMany(models.establishmentCapacity, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'capacity',
    });
    Establishment.hasMany(models.establishmentJobs, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'jobs',
    });
    Establishment.hasMany(models.establishmentAudit, {
      foreignKey: 'establishmentFk',
      sourceKey: 'id',
      as: 'auditEvents',
      hooks: true,
      onDelete: 'CASCADE',
    });
    Establishment.hasMany(models.worker, {
      foreignKey: 'establishmentFk',
      sourceKey: 'id',
      as: 'workers',
      onDelete: 'CASCADE',
    });
    Establishment.hasMany(models.notes, {
      foreignKey: 'establishmentFk',
      sourceKey: 'id',
      as: 'notes',
      onDelete: 'CASCADE',
    });
    Establishment.hasMany(models.establishment, {
      foreignKey: 'parentId',
      sourceKey: 'id',
      as: 'Subsidiaries',
    });
    Establishment.hasMany(models.Approvals, {
      foreignKey: 'ID',
      sourceKey: 'id',
      as: 'Approvals',
    });
  };

  Establishment.turnoverData = function (establishmentId) {
    return this.findByPk(establishmentId, {
      attributes: ['id', 'NumberOfStaffValue', 'LeaversValue'],
    });
  };

  Establishment.findWithWorkersAndTraining = function (establishmentId) {
    return this.findByPk(establishmentId, {
      attributes: ['id'],
      include: {
        model: sequelize.models.worker,
        attributes: ['id', 'uid', 'NameOrIdValue'],
        as: 'workers',
        where: {
          archived: false,
        },
        include: [
          {
            model: sequelize.models.job,
            as: 'mainJob',
            attributes: ['id', 'title'],
            required: false,
          },
          {
            model: sequelize.models.workerTraining,
            as: 'workerTraining',
            attributes: ['id', 'uid', 'title', 'expires', 'categoryFk'],
          },
        ],
      },
    });
  };

  Establishment.findbyId = async function (id) {
    return await this.findOne({
      where: {
        id,
      },
    });
  };

  Establishment.findByUid = async function (uid, isRegistration = false) {
    return await this.findOne({
      where: {
        uid,
        archived: isRegistration ? { [Op.or]: [true, false] } : false,
      },
    });
  };

  Establishment.findEstablishmentWithSameNmdsId = async function (uid, nmdsId) {
    return await this.findOne({
      where: {
        uid: {
          [Op.ne]: uid,
        },
        nmdsId: nmdsId,
      },
      attributes: ['id'],
    });
  };

  Establishment.find = async function (where) {
    return await this.findOne({
      where: {
        archived: false,
        ...where,
      },
      attributes: [
        'id',
        'uid',
        'ustatus',
        'locationId',
        'provId',
        'isRegulated',
        'isParent',
        'parentId',
        'NameValue',
        'nmdsId',
      ],
    });
  };

  Establishment.closeLock = async function (LockHeldTitle, establishmentId) {
    return await this.update(
      {
        [LockHeldTitle]: true,
      },
      {
        where: {
          id: establishmentId,
          [LockHeldTitle]: false,
        },
      },
    );
  };
  Establishment.openLock = async function (LockHeldTitle, establishmentId) {
    return await this.update(
      {
        [LockHeldTitle]: false,
      },
      {
        where: {
          id: establishmentId,
        },
      },
    );
  };

  Establishment.workers = async function (establishmentId, where, attribute) {
    return this.findOne({
      attributes: ['id'],
      include: {
        model: sequelize.models.worker,
        attributes: ['id', 'uid', ...attribute],
        as: 'workers',
        where,
      },
      where: {
        id: establishmentId,
      },
    });
  };

  Establishment.searchEstablishments = async function (where) {
    return await this.findAll({
      attributes: [
        'id',
        'uid',
        'NameValue',
        'nmdsId',
        'isRegulated',
        'isParent',
        'address1',
        'address2',
        'town',
        'county',
        'postcode',
        'locationId',
        'dataOwner',
        'updated',
        'provId',
        'EmployerTypeValue',
        'EmployerTypeOther',
      ],
      where: {
        ustatus: {
          [Op.is]: null,
        },
        ...where,
      },
      order: [['NameValue', 'ASC']],
      include: [
        {
          model: sequelize.models.establishment,
          attributes: ['id', 'uid', 'nmdsId'],
          as: 'Parent',
          required: false,
        },
        {
          model: sequelize.models.establishment,
          attributes: ['NameValue'],
          as: 'Subsidiaries',
          required: false,
        },
        {
          model: sequelize.models.user,
          attributes: ['id', 'uid', 'FullNameValue', 'SecurityQuestionValue', 'SecurityQuestionAnswerValue'],
          as: 'users',
          required: false,
          where: {
            UserRoleValue: 'Edit',
            archived: false,
          },
          include: [
            {
              model: sequelize.models.login,
              attributes: ['username', 'isActive'],
            },
          ],
        },
        {
          model: sequelize.models.notes,
          attributes: ['note', 'createdAt', 'noteType'],
          as: 'notes',
          include: [
            {
              model: sequelize.models.user,
              attributes: ['FullNameValue'],
              as: 'user',
            },
          ],
        },
      ],
    });
  };
  Establishment.generateDeleteReportData = async function (lastUpdatedDate) {
    return await this.findAll({
      attributes: [
        'uid',
        'id',
        'NameValue',
        'nmdsId',
        'isRegulated',
        'address1',
        'address2',
        'address3',
        'town',
        'county',
        'postcode',
        'locationId',
        'updated',
        'EmployerTypeValue',
        'EmployerTypeOther',
      ],
      order: [['NameValue', 'ASC']],
      include: [
        {
          model: sequelize.models.lastUpdatedEstablishmentsView,
          as: 'LastUpdated',
          attributes: ['id', 'dataOwner', 'lastUpdated'],
          where: {
            lastUpdated: {
              [Op.lte]: lastUpdatedDate,
            },
          },
          order: [['updated', 'DESC']],
        },
        {
          model: sequelize.models.services,
          as: 'mainService',
          attributes: ['name'],
        },
        {
          model: sequelize.models.establishment,
          as: 'Parent',
          attributes: ['NameValue'],
          required: false,
        },
      ],
    });
  };

  Establishment.getMissingEstablishmentRefCount = async function (establishmentId, isParent) {
    const scopes = ['defaultScope', 'noUstatus', 'noLocalIdentifier'];

    if (isParent) {
      scopes.push({ method: ['parentAndChildWorkplaces', establishmentId] });
    } else {
      scopes.push({ method: ['withEstablishmentId', establishmentId] });
    }
    return await this.scope(scopes).count();
  };

  Establishment.getEstablishmentWithPrimaryUser = async function (uid, isRegistration = false) {
    return await this.findOne({
      attributes: [
        'NameValue',
        'IsRegulated',
        'LocationID',
        'ProvID',
        'Address1',
        'Address2',
        'Address3',
        'Town',
        'County',
        'PostCode',
        'NmdsID',
        'EstablishmentID',
        'ParentID',
        'ParentUID',
        'created',
        'updatedBy',
        'Status',
        'EstablishmentUID',
        'Reviewer',
        'InReview',
        'EmployerTypeValue',
        'EmployerTypeOther',
      ],
      where: {
        uid,
        archived: isRegistration ? { [Op.or]: [true, false] } : false,
      },
      include: [
        {
          model: sequelize.models.services,
          as: 'mainService',
          attributes: ['id', 'name'],
        },
        {
          model: sequelize.models.user,
          as: 'users',
          attributes: [
            'EmailValue',
            'PhoneValue',
            'FullNameValue',
            'SecurityQuestionValue',
            'SecurityQuestionAnswerValue',
            'created',
          ],
          where: {
            isPrimary: true,
          },
          required: false,
          include: [
            {
              model: sequelize.models.login,
              attributes: ['id', 'username'],
            },
          ],
        },
      ],
    });
  };

  Establishment.getEstablishmentRegistrationsByStatus = async function (isRejection) {
    const params = isRejection
      ? { ustatus: 'REJECTED', archived: true }
      : { ustatus: { [Op.or]: ['PENDING', 'IN PROGRESS'] } };

    return await this.findAll({
      attributes: [
        'NameValue',
        'PostCode',
        'ParentID',
        'ParentUID',
        'created',
        'updated',
        'Status',
        'EstablishmentUID',
        'IsRegulated',
      ],
      where: params,
      order: [['created', 'DESC']],
    });
  };

  Establishment.getNmdsIdUsingEstablishmentId = async function (id) {
    return await this.findOne({
      where: {
        id: id,
      },
      attributes: ['NmdsID'],
    });
  };

  Establishment.getEstablishmentsWithMissingWorkerRef = async function (establishmentId, isParent) {
    const scopes = ['defaultScope', 'noUstatus'];

    if (isParent) {
      scopes.push({ method: ['parentAndChildWorkplaces', establishmentId] });
    } else {
      scopes.push({ method: ['withEstablishmentId', establishmentId] });
    }

    return this.scope(scopes).findAll({
      attributes: ['uid', 'NameValue'],
      include: {
        attributes: ['id'],
        model: sequelize.models.worker.scope('active', 'noLocalIdentifier'),
        as: 'workers',
      },
    });
  };

  Establishment.getMissingWorkerRefCount = async function (establishmentId, isParent) {
    const scopes = ['defaultScope', 'noUstatus'];

    if (isParent) {
      scopes.push({ method: ['parentAndChildWorkplaces', establishmentId] });
    } else {
      scopes.push({ method: ['withEstablishmentId', establishmentId] });
    }
    return await this.scope(scopes).count({
      include: {
        model: sequelize.models.worker.scope('active', 'noLocalIdentifier'),
        as: 'workers',
      },
    });
  };

  Establishment.downloadEstablishments = async function (establishmentId) {
    return await this.findAll({
      attributes: [
        'LocalIdentifierValue',
        'id',
        'NameValue',
        'address1',
        'address2',
        'address3',
        'town',
        'postcode',
        'EmployerTypeValue',
        'EmployerTypeOther',
        'isRegulated',
        'shareWithCQC',
        'shareWithLA',
        'provId',
        'locationId',
        'NumberOfStaffValue',
        'VacanciesValue',
        'StartersValue',
        'LeaversValue',
        'reasonsForLeaving',
        'moneySpentOnAdvertisingInTheLastFourWeeks',
        'peopleInterviewedInTheLastFourWeeks',
        'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
        'wouldYouAcceptCareCertificatesFromPreviousEmployment',
        'careWorkersLeaveDaysPerYear',
        'careWorkersCashLoyaltyForFirstTwoYears',
        'sickPay',
        'pensionContribution',
      ],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
            dataOwner: 'Workplace',
          },
          {
            parentId: establishmentId,
            dataOwner: 'Parent',
          },
        ],
        archived: false,
        ustatus: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: sequelize.models.establishment,
          attributes: ['id', 'uid', 'nmdsId'],
          as: 'Parent',
          required: false,
        },
        {
          model: sequelize.models.services,
          attributes: ['id', 'reportingID'],
          as: 'mainService',
        },
        {
          model: sequelize.models.services,
          attributes: ['id', 'reportingID'],
          as: 'otherServices',
        },
        {
          model: sequelize.models.serviceUsers,
          as: 'serviceUsers',
        },
        {
          model: sequelize.models.establishmentCapacity,
          attributes: ['id', 'serviceCapacityId', 'answer'],
          as: 'capacity',
          include: [
            {
              model: sequelize.models.serviceCapacity,
              as: 'reference',
              attributes: ['id', 'question', 'type'],
              include: [
                {
                  model: sequelize.models.services,
                  attributes: ['id', 'reportingID'],
                  as: 'service',
                },
              ],
            },
          ],
        },
        {
          model: sequelize.models.establishmentJobs,
          attributes: ['jobId', 'type', 'total'],
          as: 'jobs',
        },
      ],
    });
  };

  Establishment.downloadWorkers = async function (establishmentId) {
    return await this.findAll({
      attributes: ['LocalIdentifierValue', 'id'],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
            dataOwner: 'Workplace',
          },
          {
            parentId: establishmentId,
            dataOwner: 'Parent',
          },
        ],
        archived: false,
        ustatus: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: sequelize.models.worker,
          attributes: [
            'id',
            'uid',
            'LocalIdentifierValue',
            'NameOrIdValue',
            'NationalInsuranceNumberValue',
            'PostcodeValue',
            'DateOfBirthValue',
            'GenderValue',
            'NationalityValue',
            'BritishCitizenshipValue',
            'CountryOfBirthValue',
            'YearArrivedValue',
            'YearArrivedYear',
            'DisabilityValue',
            'CareCertificateValue',
            'RecruitedFromValue',
            'MainJobStartDateValue',
            'SocialCareStartDateValue',
            'SocialCareStartDateYear',
            'ApprenticeshipTrainingValue',
            'ContractValue',
            'ZeroHoursContractValue',
            'DaysSickValue',
            'DaysSickDays',
            'AnnualHourlyPayValue',
            'AnnualHourlyPayRate',
            'MainJobFkOther',
            'WeeklyHoursContractedValue',
            'WeeklyHoursContractedHours',
            'WeeklyHoursAverageValue',
            'WeeklyHoursAverageHours',
            'NurseSpecialismsValue',
            'RegisteredNurseValue',
            'ApprovedMentalHealthWorkerValue',
            'QualificationInSocialCareValue',
            'OtherQualificationsValue',
          ],
          as: 'workers',
          where: {
            archived: false,
          },
          include: [
            {
              model: sequelize.models.ethnicity,
              as: 'ethnicity',
            },
            {
              model: sequelize.models.nationality,
              as: 'nationality',
            },
            {
              model: sequelize.models.country,
              as: 'countryOfBirth',
            },
            {
              model: sequelize.models.recruitedFrom,
              as: 'recruitedFrom',
            },
            {
              model: sequelize.models.job,
              as: 'mainJob',
            },
            {
              model: sequelize.models.qualification,
              as: 'highestQualification',
            },
            {
              model: sequelize.models.qualification,
              as: 'socialCareQualification',
            },
            {
              model: sequelize.models.workerNurseSpecialism,
              as: 'nurseSpecialisms',
            },
            {
              model: sequelize.models.workerQualifications,
              as: 'qualifications',
              include: {
                model: sequelize.models.workerAvailableQualifications,
                as: 'qualification',
              },
            },
          ],
        },
      ],
    });
  };

  Establishment.downloadTrainingRecords = async function (establishmentId) {
    return await this.findAll({
      attributes: ['LocalIdentifierValue', 'id'],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
            dataOwner: 'Workplace',
          },
          {
            parentId: establishmentId,
            dataOwner: 'Parent',
          },
        ],
        archived: false,
        ustatus: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: sequelize.models.worker,
          attributes: ['LocalIdentifierValue', 'id'],
          as: 'workers',
          where: {
            archived: false,
          },
          include: [
            {
              attributes: ['title', 'completed', 'expires', 'accredited', 'notes'],
              model: sequelize.models.workerTraining,
              as: 'workerTraining',
              include: {
                model: sequelize.models.workerTrainingCategories,
                as: 'category',
              },
            },
          ],
        },
      ],
    });
  };

  // DO NOT USE if property is tracked (updatedBy, audit logs etc.)
  Establishment.updateEstablishment = async function (establishmentId, updatedEstablishment) {
    return await this.update(updatedEstablishment, {
      where: {
        id: establishmentId,
      },
    });
  };

  Establishment.findByLocationID = async function (locationID) {
    return await this.findAll({
      where: {
        locationId: locationID,
      },
      attributes: ['locationId'],
    });
  };

  Establishment.findEstablishmentsByLocationID = async function (locationIDs) {
    return await this.findAll({
      where: {
        locationId: {
          [Op.or]: locationIDs,
        },
      },
      attributes: ['locationId'],
    });
  };

  Establishment.workersAndTraining = async function (
    establishmentId,
    includeMandatoryTrainingBreakdown = false,
    isParent = false,
    limit = 0,
    pageIndex = 0,
    sortBy = 'staffNameAsc',
    searchTerm = '',
  ) {
    const currentDate = moment().toISOString();
    const expiresSoonAlertDate = await this.getExpiresSoonAlertDate(establishmentId);
    const expiresSoon = moment().add(expiresSoonAlertDate.get('ExpiresSoonAlertDate'), 'days').toISOString();
    const offset = pageIndex * limit;

    let attributes = [
      'id',
      'uid',
      'LocalIdentifierValue',
      'NameOrIdValue',
      'ContractValue',
      'CompletedValue',
      'created',
      'updated',
      'updatedBy',
      'lastWdfEligibility',
      'wdfEligible',
      [
        sequelize.literal('(SELECT COUNT(0) FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID")'),
        'trainingCount',
      ],
      [
        sequelize.literal('(SELECT COUNT(0) FROM cqc."WorkerQualifications" WHERE "WorkerFK" = "workers"."ID")'),
        'qualificationCount',
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(0) FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID" AND "Expires" < '${currentDate}')`,
        ),
        'expiredTrainingCount',
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(0) FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID" AND "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}')`,
        ),
        'expiringTrainingCount',
      ],
      [
        sequelize.literal(
          `
            (
              SELECT
                  COUNT(0)
                FROM cqc."MandatoryTraining"
                WHERE "EstablishmentFK" = "workers"."EstablishmentFK"
                AND "JobFK" = "workers"."MainJobFKValue"
                AND "TrainingCategoryFK" NOT IN (
                  SELECT
                    DISTINCT "CategoryFK"
                  FROM cqc."WorkerTraining"
                  WHERE "WorkerFK" = "workers"."ID"
                )
            )
            `,
        ),
        'missingMandatoryTrainingCount',
      ],
      [
        sequelize.literal('(SELECT MAX("updated") FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID")'),
        'trainingLastUpdated',
      ],
      [
        sequelize.literal('(SELECT MAX("updated") FROM cqc."WorkerQualifications" WHERE "WorkerFK" = "workers"."ID")'),
        'qualificationsLastUpdated',
      ],
      'LongTermAbsence',
    ];

    if (includeMandatoryTrainingBreakdown) {
      const mandatoryTrainingAttributes = [
        [
          sequelize.literal(
            `(SELECT COUNT(0) FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID" AND "Expires" < '${currentDate}' AND "CategoryFK" IN
              (
                SELECT DISTINCT "TrainingCategoryFK" FROM cqc."MandatoryTraining"
                WHERE "EstablishmentFK" = "workers"."EstablishmentFK"
                AND "JobFK" = "workers"."MainJobFKValue"
              )
            )`,
          ),
          'expiredMandatoryTrainingCount',
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(0) FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID"  AND "CategoryFK"  IN
              (
                SELECT DISTINCT "TrainingCategoryFK" FROM cqc."MandatoryTraining"
                WHERE "EstablishmentFK" = "workers"."EstablishmentFK"
                AND "JobFK" = "workers"."MainJobFKValue"
              )
            )`,
          ),
          'mandatoryTrainingCount',
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(0) FROM cqc."WorkerTraining" WHERE "WorkerFK" = "workers"."ID" AND "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' AND "CategoryFK" IN
              (
                SELECT DISTINCT "TrainingCategoryFK" FROM cqc."MandatoryTraining"
                WHERE "EstablishmentFK" = "workers"."EstablishmentFK"
                AND "JobFK" = "workers"."MainJobFKValue"
              )
            )`,
          ),
          'expiringMandatoryTrainingCount',
        ],
      ];

      attributes = [...attributes, ...mandatoryTrainingAttributes];
    }

    let subsidiaries = [];
    if (isParent) {
      subsidiaries = [
        {
          parentId: establishmentId,
          dataOwner: 'Parent',
        },
        {
          parentId: establishmentId,
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        },
      ];
    }

    const workerPagination = {
      subQuery: false,
      limit,
      offset,
    };

    const order = {
      staffNameAsc: [['workers', 'NameOrIdValue', 'ASC']],
      staffNameDesc: [['workers', 'NameOrIdValue', 'DESC']],
      jobRoleAsc: [[sequelize.literal('"workers.mainJob.jobRoleName"'), 'ASC']],
      jobRoleDesc: [[sequelize.literal('"workers.mainJob.jobRoleName"'), 'DESC']],
      wdfMeeting: [['workers', 'wdfEligible', 'DESC']],
      wdfNotMeeting: [['workers', 'wdfEligible', 'ASC']],
      trainingExpiringSoon: [
        [sequelize.literal('"workers.expiringTrainingCount"'), 'DESC'],
        ['workers', 'NameOrIdValue', 'ASC'],
      ],
      trainingExpired: [
        [sequelize.literal('"workers.expiredTrainingCount"'), 'DESC'],
        ['workers', 'NameOrIdValue', 'ASC'],
      ],
      trainingMissing: [
        [sequelize.literal('"workers.missingMandatoryTrainingCount"'), 'DESC'],
        ['workers', 'NameOrIdValue', 'ASC'],
      ],
    }[sortBy] || [['workers', 'NameOrIdValue', 'ASC']];

    return this.findAndCountAll({
      attributes: ['id', 'NameValue'],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
          },
          ...subsidiaries,
        ],
      },
      include: [
        {
          model: sequelize.models.worker,
          as: 'workers',
          attributes,
          where: {
            archived: false,
            ...(searchTerm ? { NameOrIdValue: { [Op.iLike]: `%${searchTerm}%` } } : {}),
          },
          required: true,
          include: [
            {
              model: sequelize.models.job,
              as: 'mainJob',
              attributes: [
                'id',
                'title',
                [
                  sequelize.literal(
                    '(SELECT CASE WHEN "workers"."MainJobFkOther" IS NOT NULL THEN "workers"."MainJobFkOther" ELSE "JobName" END)',
                  ),
                  'jobRoleName',
                ],
              ],
              required: false,
            },
          ],
        },
      ],
      order,
      ...(limit ? workerPagination : {}),
    });
  };

  Establishment.getEstablishmentTrainingRecords = async function (establishmentId, isParent = false) {
    let attributes = [
      'id',
      'NameOrIdValue',
      [
        sequelize.literal(
          `
            (
              SELECT json_agg(cqc."TrainingCategories"."Category")
                FROM cqc."MandatoryTraining"
                RIGHT JOIN cqc."TrainingCategories" ON
                "TrainingCategoryFK" = cqc."TrainingCategories"."ID"
                WHERE "EstablishmentFK" = "workers"."EstablishmentFK"
                AND "JobFK" = "workers"."MainJobFKValue"
            )
          `,
        ),
        'mandatoryTrainingCategories',
      ],
      'LongTermAbsence',
    ];
    let subsidiaries = [];
    if (isParent) {
      subsidiaries = [
        {
          parentId: establishmentId,
          dataOwner: 'Parent',
        },
        {
          parentId: establishmentId,
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        },
      ];
    }
    return this.findAll({
      attributes: ['id', 'NameValue', 'ExpiresSoonAlertDate'],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
          },
          ...subsidiaries,
        ],
      },
      include: [
        {
          model: sequelize.models.worker,
          as: 'workers',
          attributes,
          where: {
            archived: false,
          },
          required: false,
          include: [
            {
              model: sequelize.models.job,
              as: 'mainJob',
              attributes: ['id', 'title'],
              required: false,
            },
            {
              model: sequelize.models.workerTraining,
              as: 'workerTraining',
              attributes: ['CategoryFK', 'Title', 'Expires', 'Completed', 'Accredited'],
              required: false,
              include: [
                {
                  model: sequelize.models.workerTrainingCategories,
                  as: 'category',
                  attributes: ['category'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
  };

  Establishment.getWorkerQualifications = async function (establishmentId, isParent = false) {
    let subsidiaries = [];
    if (isParent) {
      subsidiaries = [
        {
          parentId: establishmentId,
          dataOwner: 'Parent',
        },
        {
          parentId: establishmentId,
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        },
      ];
    }

    return this.findAll({
      attributes: ['NameValue'],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
          },
          ...subsidiaries,
        ],
      },
      include: [
        {
          model: sequelize.models.worker,
          as: 'workers',
          attributes: ['NameOrIdValue'],
          where: {
            archived: false,
          },
          required: false,
          include: [
            {
              model: sequelize.models.job,
              as: 'mainJob',
              attributes: ['id', 'title'],
              required: false,
            },
            {
              model: sequelize.models.workerQualifications,
              as: 'qualifications',
              attributes: ['Year'],
              include: [
                {
                  model: sequelize.models.workerAvailableQualifications,
                  as: 'qualification',
                  attributes: ['group', 'title', 'level'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
  };

  Establishment.getWorkersWithCareCertificateStatus = async function (establishmentId, isParent = false) {
    let subsidiaries = [];

    if (isParent) {
      subsidiaries = [
        {
          parentId: establishmentId,
          dataOwner: 'Parent',
        },
        {
          parentId: establishmentId,
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        },
      ];
    }

    return this.findAll({
      attributes: ['id', 'NameValue'],
      where: {
        [Op.or]: [
          {
            id: establishmentId,
          },
          ...subsidiaries,
        ],
      },
      include: [
        {
          model: sequelize.models.worker,
          as: 'workers',
          attributes: ['NameOrIdValue', 'CareCertificateValue'],
          where: {
            CareCertificateValue: { [Op.ne]: null },
            archived: false,
          },
          required: false,
          include: [
            {
              model: sequelize.models.job,
              as: 'mainJob',
              attributes: ['id', 'title'],
              required: false,
            },
          ],
        },
      ],
    });
  };

  Establishment.getExpiresSoonAlertDate = async function (establishmentId) {
    return this.findOne({
      attributes: ['ExpiresSoonAlertDate'],
      where: {
        id: establishmentId,
      },
    });
  };

  Establishment.getInfoForPermissions = async function (establishmentId) {
    return this.findOne({
      attributes: [
        'IsRegulated',
        [
          sequelize.literal(`
            CASE WHEN "establishment"."ParentID" IS NULL THEN
              false
            ELSE
              true
            END
          `),
          'hasParent',
        ],
        [
          sequelize.literal(`
            CASE WHEN "establishment"."DataOwnershipRequested" IS NULL THEN
              false
            ELSE
              true
            END
          `),
          'dataOwnershipRequested',
        ],
        [
          sequelize.literal(`
            CASE WHEN COUNT("Approvals"."ID") = 0 THEN
              false
            ELSE
              true
            END
          `),
          'hasRequestedToBecomeAParent',
        ],
      ],
      where: {
        id: establishmentId,
      },
      include: [
        {
          model: sequelize.models.services,
          as: 'mainService',
          attributes: ['id'],
        },
        {
          model: sequelize.models.Approvals,
          as: 'Approvals',
          where: {
            Status: 'Pending',
            ApprovalType: 'BecomeAParent',
          },
          attributes: ['ID'],
          required: false,
        },
      ],
      group: ['establishment.EstablishmentID', 'mainService.id', 'Approvals.ID'],
    });
  };

  Establishment.updateDataChangesLastUpdatedDate = async function (establishmentId, lastUpdated) {
    return await this.update(
      {
        dataChangesLastUpdated: lastUpdated,
      },
      {
        where: {
          id: establishmentId,
        },
      },
    );
  };

  Establishment.getdataChangesLastUpdated = async function (establishmentId) {
    return await this.findOne({
      attributes: ['DataChangesLastUpdated'],
      where: {
        id: establishmentId,
      },
    });
  };

  Establishment.authenticateEstablishment = async function (where) {
    return await this.findOne({
      attributes: ['id', 'dataPermissions', 'dataOwner', 'parentId', 'nmdsId', 'isParent'],
      where,
    });
  };

  Establishment.getChildWorkplaces = async function (establishmentUid, limit = 0, pageIndex = 0, searchTerm = '') {
    const offset = pageIndex * limit;

    const data = await this.findAndCountAll({
      attributes: ['uid', 'updated', 'NameValue', 'dataOwner', 'dataPermissions', 'dataOwnershipRequested', 'ustatus'],
      include: [
        {
          model: sequelize.models.services,
          as: 'mainService',
          attributes: ['name'],
        },
      ],
      where: {
        ParentUID: establishmentUid,
        ustatus: {
          [Op.or]: {
            [Op.ne]: 'REJECTED',
            [Op.is]: null,
          },
        },
        ...(searchTerm ? { NameValue: { [Op.iLike]: `%${searchTerm}%` } } : {}),
      },
      order: [
        [sequelize.literal("\"Status\" IN ('PENDING', 'IN PROGRESS')"), 'ASC'],
        ['NameValue', 'ASC'],
      ],
      limit,
      offset,
    });

    const pendingCount = await Establishment.count({
      where: {
        ParentUID: establishmentUid,
        ustatus: {
          [Op.or]: [['PENDING', 'IN PROGRESS']],
        },
      },
    });

    return { ...data, pendingCount };
  };

  Establishment.getRegistrationIdsForArchiving = async function (establishmentIds, transaction) {
    const lastMonth = moment().subtract(1, 'months').endOf('month');
    const twentyFourLastMonths = lastMonth.clone().subtract(24, 'months').format('YYYY-MM-DD');
    return await sequelize.query(
      `
    SELECT
    u."RegistrationID"
    FROM
      cqc."EstablishmentLastActivity" e
      inner join cqc."User" u  on e."EstablishmentID" = u."EstablishmentID"
        inner join cqc."Login" l on u."RegistrationID"  = l."RegistrationID"
    WHERE
      e."LastLogin" <= :twentyFourLastMonths
      AND e."LastUpdated" <= :twentyFourLastMonths
      AND NOT EXISTS
      (
         SELECT s."EstablishmentID" AS EstablishmentID
            FROM cqc."EstablishmentLastActivity" s
            WHERE  s."IsParent" = true AND EXISTS
          (
             SELECT c."EstablishmentID"
              FROM cqc."EstablishmentLastActivity" c
                WHERE s."EstablishmentID" = c."ParentID"
                 AND c."LastLogin" > :twentyFourLastMonths
                 AND c."LastUpdated" > :twentyFourLastMonths
              AND c."IsParent"= false
            ) AND s."EstablishmentID"  =  e."EstablishmentID"
     )

    and e."EstablishmentID" IN(:establishmentIds)
        `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          twentyFourLastMonths,
          establishmentIds,
        },
      },
      { transaction },
    );
  };

  Establishment.archiveInactiveWorkplaces = async function (establishmentIds) {
    try {
      return await sequelize.transaction(async (t) => {
        await Establishment.update(
          {
            archived: true,
          },
          {
            where: {
              id: establishmentIds,
            },
            transaction: t,
          },
        );

        await sequelize.models.user.update(
          {
            archived: true,
            FullNameValue: 'inactive',
            EmailValue: 'inactive',
          },
          {
            where: {
              establishmentId: establishmentIds,
            },
            transaction: t,
          },
        );
        const registrationIds = await Establishment.getRegistrationIdsForArchiving(establishmentIds, t);

        const promises = registrationIds.map((registration) => {
          return sequelize.models.login.update(
            {
              isActive: false,
              username: 'inactive' + registration.RegistrationID,
              status: 'inactive',
            },
            {
              where: {
                registrationId: registration.RegistrationID,
              },
              transaction: t,
            },
          );
        });
        return await Promise.all(promises);
      });
    } catch (error) {
      console.log({ error });
    }
  };

  return Establishment;
};
