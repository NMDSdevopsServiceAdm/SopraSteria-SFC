module.exports = function (sequelize, DataTypes) {
  const BenchmarksSickness = sequelize.define(
    'benchmarksSickness',
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
      sickness: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Sickness',
      },
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'BenchmarksSickness',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  BenchmarksSickness.associate = (models) => {
    BenchmarksSickness.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as: 'BenchmarkToService',
    });
    BenchmarksSickness.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentFK',
      targetKey: 'id',
      as: 'benchmarkEstablishment',
    });
  };

  return BenchmarksSickness;
};
