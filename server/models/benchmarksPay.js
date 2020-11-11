module.exports = function (sequelize, DataTypes) {
  const BenchmarksPay = sequelize.define('benchmarksPay', {
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
  });

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

  BenchmarksPay.getRankings = async function (establishmentId) {
    const cssr = await sequelize.models.cssr.getCSSR(establishmentId);
    return await this.findAll({
      where: {
        CssrID: cssr,
      },
      include: [
        {
          model: sequelize.models.services,
          as: 'BenchmarkToService',
          include: [
            {
              model: sequelize.models.establishment,
              where: { id: establishmentId },
              as: 'establishments',
            },
          ],
        },
      ],
    });
  };

  return BenchmarksPay;
};
