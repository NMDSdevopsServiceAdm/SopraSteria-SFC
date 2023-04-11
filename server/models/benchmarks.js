module.exports = function (sequelize, DataTypes) {
  const Benchmarks = sequelize.define(
    'benchmarks',
    {
      CssrID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      MainServiceFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      pay: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Pay',
      },
      sickness: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Sickness',
      },
      turnover: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'Turnover',
      },
      qualifications: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        field: 'Qualifications',
      },
      workplaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Workplaces',
      },
      staff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Staff',
      },
      payGoodCqc: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'PayGoodCQC',
      },
      payLowTurnover: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'PayLowTurnover',
      },
      sicknessGoodCqc: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'SicknessGoodCQC',
      },
      sicknessLowTurnover: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'SicknessLowTurnover',
      },
      turnoverGoodCqc: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'TurnoverGoodCQC',
      },
      turnoverLowTurnover: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'TurnoverLowTurnover',
      },
      qualificationsGoodCqc: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        field: 'QualificationsGoodCQC',
      },
      qualificationsLowTurnover: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        field: 'QualificationsLowTurnover',
      },
      payWorkplaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PayWorkplaces',
      },
      payStaff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PayStaff',
      },
      turnoverWorkplaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'TurnoverWorkplaces',
      },
      turnoverStaff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'TurnoverStaff',
      },
      sicknessWorkplaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'SicknessWorkplaces',
      },
      sicknessStaff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'SicknessStaff',
      },
      qualificationsWorkplaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'QualificationsWorkplaces',
      },
      qualificationsStaff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'QualificationsStaff',
      },
    },
    {
      tableName: '"Benchmarks"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  Benchmarks.associate = (models) => {
    Benchmarks.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as: 'BenchmarkToService',
    });
  };

  Benchmarks.getBenchmarkData = async function (establishmentId) {
    const cssr = await sequelize.models.cssr.getCSSR(establishmentId);
    const { mainService } = await sequelize.models.establishment.findbyId(establishmentId);

    const reportingId = mainService.reportingID;
    const specificMainServiceReportingIds = [1, 2, 8];
    const mainServiceReportingId = specificMainServiceReportingIds.includes(reportingId) ? reportingId : 10;

    if (!cssr) return {};
    return await this.findOne({
      where: {
        CssrID: cssr,
      },
      include: [
        {
          attributes: ['id', 'reportingID'],
          model: sequelize.models.services,
          as: 'BenchmarkToService',
          on: {
            col1: sequelize.where(sequelize.col('benchmarks.MainServiceFK'), '=', mainServiceReportingId),
          },
          include: [
            {
              attributes: ['id'],
              model: sequelize.models.establishment,
              where: {
                id: establishmentId,
              },
              as: 'establishmentsMainService',
              required: true,
            },
          ],
          required: true,
        },
      ],
      raw: true,
    });
  };

  return Benchmarks;
};
