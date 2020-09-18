/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const LocalAuthorityReportEstablishment = sequelize.define(
    'localAuthorityReportEstablishment',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: '"ID"',
      },
      reportFrom: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"ReportFrom"',
      },
      reportTo: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"ReportTo"',
      },
      establishmentFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"EstablishmentFK"',
      },
      workplaceFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkplaceFK"',
      },
      workplaceName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"WorkplaceName"',
      },
      workplaceId: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"WorkplaceID"',
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'LastUpdatedDate',
      },
      establishmentType: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"EstablishmentType"',
      },
      mainService: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"MainService"',
      },
      serviceUserGroups: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"ServiceUserGroups"',
      },
      capacityOfMainService: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"CapacityOfMainService"',
      },
      utilisationOfMainService: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"UtilisationOfMainService"',
      },

      numberOfVacancies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfVacancies"',
      },
      numberOfStarters: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfStarters"',
      },
      numberOfLeavers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfLeavers"',
      },
      numberOfStaffRecords: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfStaffRecords"',
      },
      workplaceComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"WorkplaceComplete"',
      },
      numberOfIndividualStaffRecords: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfIndividualStaffRecords"',
      },
      percentageOfStaffRecords: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        field: '"PercentageOfStaffRecords"',
      },
      numberOfStaffRecordsNotAgency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfStaffRecordsNotAgency"',
      },
      numberOfCompleteStaffNotAgency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfCompleteStaffNotAgency"',
      },
      percentageOfCompleteStaffRecords: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        field: '"PercentageOfCompleteStaffRecords"',
      },
      numberOfAgencyStaffRecords: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfAgencyStaffRecords"',
      },
      numberOfCompleteAgencyStaffRecords: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"NumberOfCompleteAgencyStaffRecords"',
      },
      percentageOfCompleteAgencyStaffRecords: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        field: '"PercentageOfCompleteAgencyStaffRecords"',
      },
    },
    {
      tableName: '"LocalAuthorityReportEstablishment"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return LocalAuthorityReportEstablishment;
};
