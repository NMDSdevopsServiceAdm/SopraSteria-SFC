/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const EstablishmentStarters = sequelize.define('establishmentStarters', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"EstablishmentJobID"'
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"JobID"'
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentID"'
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Starters'],
      default: 'Starters',
      field: '"JobType"'
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"Total"'
    }
  }, {
    tableName: '"StartersVW"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  EstablishmentStarters.associate = (models) => {
    EstablishmentStarters.belongsTo(models.job, {
      foreignKey: 'jobId',
      targetKey: 'id',
      as: 'reference'
    });
  };

  return EstablishmentStarters;
};
