/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Establishment = sequelize.define('establishment', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"EstablishmentID"'
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: '"EstablishmentUID"'
    },
    ustatus: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Status"'
    },
    address1: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address1"'
    },
    Address1SavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"Address1SavedAt"'
    },
    Address1ChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"Address1ChangedAt"'
    },
    Address1SavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address1SavedBy"'
    },
    Address1ChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address1ChangedBy"'
    },
    address2: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address2"'
    },
    Address2SavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"Address2SavedAt"'
    },
    Address2ChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"Address2ChangedAt"'
    },
    Address2SavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address2SavedBy"'
    },
    Address2ChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address2ChangedBy"'
    },
    address3: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address3"'
    },
    Address3SavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"Address3SavedAt"'
    },
    Address3ChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"Address3ChangedAt"'
    },
    Address3SavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address3SavedBy"'
    },
    Address3ChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address3ChangedBy"'
    },
    town: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Town"'
    },
    TownSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"TownSavedAt"'
    },
    TownChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"TownChangedAt"'
    },
    TownSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"TownSavedBy"'
    },
    TownChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"TownChangedBy"'
    },
    county: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"County"'
    },
    CountySavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"CountySavedAt"'
    },
    CountyChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"CountyChangedAt"'
    },
    CountySavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"CountySavedBy"'
    },
    CountyChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"CountyChangedBy"'
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"LocationID"'
    },
    LocationIdSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LocationIdSavedAt"'
    },
    LocationIdChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LocationIdChangedAt"'
    },
    LocationIdSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"LocationIdSavedBy"'
    },
    LocationIdChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"LocationIdChangedBy"'
    },
    provId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"ProvID"'
    },
    postcode: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"PostCode"'
    },
    PostcodeSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"PostcodeSavedAt"'
    },
    PostcodeChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"PostcodeChangedAt"'
    },
    PostcodeSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PostcodeSavedBy"'
    },
    PostcodeChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PostcodeChangedBy"'
    },
    isRegulated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"IsRegulated"'
    },
    IsRegulatedSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"IsRegulatedSavedAt"'
    },
    IsRegulatedChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"IsRegulatedChangedAt"'
    },
    IsRegulatedSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"IsRegulatedSavedBy"'
    },
    IsRegulatedChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"IsRegulatedChangedBy"'
    },
    overallWdfEligibility: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"OverallWdfEligibility"'
    },
    establishmentWdfEligibility: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EstablishmentWdfEligibility"'
    },
    staffWdfEligibility: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"StaffWdfEligibility"'
    },
    lastWdfEligibility: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LastWdfEligibility"'
    },
    isParent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false,
      field: '"IsParent"'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"ParentID"'
    },
    parentUid: {
      type: DataTypes.UUID,
      allowNull: true,
      field: '"ParentUID"'
    },
    dataOwner: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Workplace','Parent'],
      field: '"DataOwner"',
      default: 'Workplace',
    },
    dataPermissions: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Workplace','Workplace and Staff', 'None'],
      field: '"DataPermissions"',
    },
    NameValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: '"NameValue"'
    },
    NameSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NameSavedAt"'
    },
    NameChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NameChangedAt"'
    },
    NameSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NameSavedBy"'
    },
    NameChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NameChangedBy"'
    },
    MainServiceFKValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"MainServiceFKValue"'
    },
    MainServiceFKSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainServiceFKSavedAt"'
    },
    MainServiceFKChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainServiceFKChangedAt"'
    },
    MainServiceFKSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"MainServiceFKSavedBy"'
    },
    MainServiceFKChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"MainServiceFKChangedBy"'
    },
    MainServiceFkOther: {
      type: DataTypes.TEXT,
      allowNull: true,
      primaryKey: false,
      field: '"MainServiceFkOther"'
    },
    EmployerTypeValue: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Private Sector', 'Voluntary / Charity', 'Other', 'Local Authority (generic/other)', 'Local Authority (adult services)'],
      field: '"EmployerTypeValue"'
    },
    EmployerTypeSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EmployerTypeSavedAt"'
    },
    EmployerTypeChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EmployerTypeChangedAt"'
    },
    EmployerTypeSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"EmployerTypeSavedBy"'
    },
    EmployerTypeChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"EmployerTypeChangedBy"'
    },
    EmployerTypeOther: {
      type: DataTypes.TEXT,
      allowNull: true,
      primaryKey: false,
      field: '"EmployerTypeOther"'
    },
    NumberOfStaffValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"NumberOfStaffValue"'
    },
    NumberOfStaffSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NumberOfStaffSavedAt"'
    },
    NumberOfStaffChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NumberOfStaffChangedAt"'
    },
    NumberOfStaffSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NumberOfStaffSavedBy"'
    },
    NumberOfStaffChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NumberOfStaffChangedBy"'
    },
    OtherServicesSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"OtherServicesSavedAt"'
    },
    OtherServicesChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"OtherServicesChangedAt"'
    },
    OtherServicesSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"OtherServicesSavedBy"'
    },
    OtherServicesChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"OtherServicesChangedBy"'
    },
    ServiceUsersSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ServiceUsersSavedAt"'
    },
    ServiceUsersChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ServiceUsersChangedAt"'
    },
    ServiceUsersSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ServiceUsersSavedBy"'
    },
    ServiceUsersChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ServiceUsersChangedBy"'
    },
    CapacityServicesSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"CapacityServicesSavedAt"'
    },
    CapacityServicesChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"CapacityServicesChangedAt"'
    },
    CapacityServicesSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"CapacityServicesSavedBy"'
    },
    CapacityServicesChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"CapacityServicesChangedBy"'
    },
    ShareDataValue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"ShareDataValue"'
    },
    ShareDataSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ShareDataSavedAt"'
    },
    ShareDataChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ShareDataChangedAt"'
    },
    ShareDataSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ShareDataSavedBy"'
    },
    ShareDataChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ShareDataChangedBy"'
    },
    shareWithCQC: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"ShareDataWithCQC"'
    },
    shareWithLA: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"ShareDataWithLA"'
    },
    ShareWithLASavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ShareWithLASavedAt"'
    },
    ShareWithLAChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ShareWithLAChangedAt"'
    },
    ShareWithLASavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ShareWithLASavedBy"'
    },
    ShareWithLAChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ShareWithLAChangedBy"'
    },
    VacanciesValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["None","Don't know", "With Jobs"],
      field: '"VacanciesValue"'
    },
    VacanciesSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"VacanciesSavedAt"'
    },
    VacanciesChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"VacanciesChangedAt"'
    },
    VacanciesSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"VacanciesSavedBy"'
    },
    VacanciesChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"VacanciesChangedBy"'
    },
    StartersValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["None","Don't know", "With Jobs"],
      field: '"StartersValue"'
    },
    StartersSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"StartersSavedAt"'
    },
    StartersChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"StartersChangedAt"'
    },
    StartersSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"StartersSavedBy"'
    },
    StartersChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"StartersChangedBy"'
    },
    LeaversValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["None","Don't know", "With Jobs"],
      field: '"LeaversValue"'
    },
    LeaversSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LeaversSavedAt"'
    },
    LeaversChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LeaversChangedAt"'
    },
    LeaversSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"LeaversSavedBy"'
    },
    LeaversChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"LeaversChangedBy"'
    },
    LocalIdentifierValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
      field: '"LocalIdentifierValue"'
    },
    LocalIdentifierSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LocalIdentifierSavedAt"'
    },
    LocalIdentifierChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LocalIdentifierChangedAt"'
    },
    LocalIdentifierSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"LocalIdentifierSavedBy"'
    },
    LocalIdentifierChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"LocalIdentifierChangedBy"'
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"Archived"',
      defaultValue: false
    },
    nmdsId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"NmdsID"'
    },
    source: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["Online","Bulk"],
      default: 'Online',
      field: '"DataSource"'
    },
    lastBulkUploaded: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LastBulkUploaded"'
    },
    dataOwnershipRequested: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DataOwnershipRequested"'
    },
    linkToParentRequested: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"LinkToParentRequested"'
    },
    reasonsForLeaving: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ReasonsForLeaving"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created'
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated'
    },
    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'updatedby'
    },
    trainingReportLockHeld: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false,
      field: 'TrainingReportLockHeld'
    },
    laReportLockHeld: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false,
      field: 'LaReportLockHeld'
    }
  }, {
    defaultScope: {
      where: {
        archived: false
      }
    },
    tableName: '"Establishment"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  Establishment.associate = (models) => {
    Establishment.hasMany(models.user, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'users'
    });
    Establishment.belongsTo(models.services, {
      foreignKey: 'MainServiceFKValue',
      targetKey: 'id',
      as: 'mainService'
    });
    Establishment.belongsToMany(models.services, {
      through: 'establishmentServices',
      foreignKey: 'establishmentId',
      targetKey: 'id',
      as: 'otherServices'
    });
    Establishment.belongsToMany(models.serviceUsers, {
      through: 'establishmentServiceUsers',
      foreignKey: 'establishmentId',
      targetKey: 'id',
      as: 'serviceUsers'
    });
    Establishment.hasMany(models.establishmentCapacity, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'capacity'
    });
    Establishment.hasMany(models.establishmentJobs, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'jobs'
    });
    Establishment.hasMany(models.establishmentLocalAuthority, {
      foreignKey: 'establishmentId',
      sourceKey: 'id',
      as: 'localAuthorities'
    });
    Establishment.hasMany(models.establishmentAudit, {
      foreignKey: 'establishmentFk',
      sourceKey: 'id',
      as: 'auditEvents',
      hooks:true,
      onDelete: 'CASCADE'
    });
    Establishment.hasMany(models.worker, {
      foreignKey: 'establishmentFk',
      sourceKey: 'id',
      as: 'workers',
      onDelete: 'CASCADE'
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
  }

  Establishment.findbyId = function(id) {
    return this.findOne({
      where: {
        id: id,
        archived: false
      },
      attributes: [
        'id',
        'ustatus',
        'locationId',
        'provId',
        'isRegulated',
        'isParent',
        'parentId',
        'NameValue',
        'nmdsId']
    });
  };
  Establishment.closeLock = async function(LockHeldTitle,establishmentId) {
    return await this.update(
      {
        [LockHeldTitle]: true
      }, {
        where: {
          id: establishmentId,
          [LockHeldTitle]: false
        }
      });
  };
  Establishment.openLock = async function(LockHeldTitle,establishmentId) {
    return await this.update(
      {
        [LockHeldTitle]: false
      }, {
        where: {
          id: establishmentId,
        }
      });
  };


  return Establishment;
};
