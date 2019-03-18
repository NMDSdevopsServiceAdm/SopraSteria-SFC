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
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: '"Name"'
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
    mainServiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"MainServiceId"'
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
    shareData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"ShareData"'
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
    vacancies : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["None","Don't know", "With Jobs"],
      field: '"Vacancies"'
    },
    starters : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["None","Don't know", "With Jobs"],
      field: '"Starters"'
    },
    leavers : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["None","Don't know", "With Jobs"],
      field: '"Leavers"'
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
    },
  }, {
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
      foreignKey: 'mainServiceId',
      targetKey: 'id',
      as: 'mainService'
    });
    Establishment.belongsToMany(models.services, {
      through: 'establishmentServices',
      foreignKey: 'establishmentId',
      targetKey: 'id',
      as: 'otherServices'
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
