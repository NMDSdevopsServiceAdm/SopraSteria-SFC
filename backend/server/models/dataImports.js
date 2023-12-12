/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const DataImports = sequelize.define(
    'dataImports',
    {
      type: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Benchmarks'],
        field: '"Type"',
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"Date"',
      },
    },
    {
      tableName: 'DataImports',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  DataImports.benchmarksLastUpdated = async function () {
    const dataImport = await this.findOne({
      attributes: ['date'],
      where: {
        type: 'Benchmarks',
      },
      order: [['date', 'DESC']],
    });

    if (!dataImport) {
      return null;
    }

    return dataImport.date;
  };

  return DataImports;
};
