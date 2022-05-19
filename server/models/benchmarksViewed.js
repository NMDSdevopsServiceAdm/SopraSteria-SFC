module.exports = function (sequelize, DataTypes) {
  const BenchmarksViewed = sequelize.define(
    'benchmarksViewed',
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      EstablishmentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      ViewedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'BenchmarksViewed',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  BenchmarksViewed.associate = (models) => {
    BenchmarksViewed.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentID',
      targetKey: 'id',
      as: 'benchmarkEstablishment',
    });
  };

  return BenchmarksViewed;
};
