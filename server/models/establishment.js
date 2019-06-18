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
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Address"'
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"LocationID"'
    },
    postcode: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"PostCode"'
    },
    isRegulated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"IsRegulated"'
    },
    overallWdfEligibility: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"OverallWdfEligibility"'
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
      field: '"Owner"',
      default: 'Workplace',
    },
    parentPermissions: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Workplace','Worker'],
      field: '"ParentAccess"',
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
      as: 'auditEvents'
    });
  };

  return Establishment;
};
