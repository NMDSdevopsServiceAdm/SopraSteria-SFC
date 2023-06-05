module.exports = function (sequelize, DataTypes) {
  const BenchmarksEstablishmentsAndWorkersGoodOutstanding = sequelize.define(
    'benchmarksEstablishmentsAndWorkersGoodOutstanding',
    {
      LocalAuthorityArea: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      MainServiceFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      BaseEstablishments: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      WorkerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksEstablishmentsAndWorkersGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  BenchmarksEstablishmentsAndWorkersGoodOutstanding.getComparisonData = async function (establishmentId, mainService) {
    const cssr = await sequelize.models.cssr.getCSSR(establishmentId);
    if (!cssr) return {};
    return await this.findOne({
      attributes: ['BaseEstablishments', 'WorkerCount'],
      where: {
        LocalAuthorityArea: cssr.id,
        MainServiceFK: mainService,
      },
    });
  };

  return BenchmarksEstablishmentsAndWorkersGoodOutstanding;
};
