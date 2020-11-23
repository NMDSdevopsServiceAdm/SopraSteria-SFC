module.exports = function (sequelize, DataTypes) {
  const BenchmarksPay = sequelize.define(
    'benchmarksPay',
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
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'BenchmarksPay',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  BenchmarksPay.associate = (models) => {
    BenchmarksPay.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as: 'BenchmarkToService',
    });
    BenchmarksPay.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentFK',
      targetKey: 'id',
      as: 'benchmarkEstablishment',
    });
  };

  BenchmarksPay.getComparisonGroupRankings = async function (establishmentId) {
    const cssr = await sequelize.models.cssr.getCSSR(establishmentId);
    return await this.findAll({
      where: {
        CssrID: cssr,
        EstablishmentFK: {
          [sequelize.Op.not]: [establishmentId],
        },
      },
    });
  };

  return BenchmarksPay;
};
