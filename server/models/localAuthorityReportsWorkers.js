/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const LocalAuthorityReportWorker = sequelize.define('localAuthorityReportWorker', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: '"ID"'
    },
    localAuthorityReportEstablishmentFK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"LocalAuthorityReportEstablishmentFK"'
    },
    workerFK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"WorkerFK"'
    },
    localId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"LocalID"'
    },
    workplaceName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"WorkplaceName"'
    },
    workplaceId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"WorkplaceID"'
    },
    gender: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Gender"'
    },
    dateOfBirth: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"DateOfBirth"'
    },
    ethnicity: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Ethnicity"'
    },
    mainJob: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"MainJob"'
    },
    employmentStatus: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"EmploymentStatus"'
    },
    contractedAverageHours: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"ContractedAverageHours"'
    },
    sickDays: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"SickDays"'
    },
    payInterval: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"PayInterval"'
    },
    rateOfPay: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"RateOfPay"'
    },
    relevantSocialCareQualification: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"RelevantSocialCareQualification"'
    },
    highestSocialCareQualification: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"HighestSocialCareQualification"'
    },
    nonSocialCareQualification: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"NonSocialCareQualification"'
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'LastUpdated'
    },
    staffRecordComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'StaffRecordComplete'
    },
  }, {
    tableName: '"LocalAuthorityReportWorker"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  LocalAuthorityReportWorker.associate = (models) => {
    LocalAuthorityReportWorker.belongsTo(models.localAuthorityReportEstablishment, {
      foreignKey: 'localAuthorityReportEstablishmentFK',
      targetKey: 'id',
      as: 'establishment'
    });
  };

  return LocalAuthorityReportWorker;
};
