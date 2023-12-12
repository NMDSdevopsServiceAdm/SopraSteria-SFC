/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const WorkerNurseSpecialisms =  sequelize.define('workerNurseSpecialisms', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    workerFk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"WorkerFK"'
    },
    nurseSpecialismFk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"NurseSpecialismFK"'
    }
  }, {
    tableName: 'WorkerNurseSpecialisms',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  WorkerNurseSpecialisms.associate = (models) => {
    WorkerNurseSpecialisms.belongsTo(models.workerNurseSpecialism, {
      foreignKey: 'nurseSpecialismFk',
      targetKey: 'id',
      as: 'reference'
    });
  };

  return WorkerNurseSpecialisms;
};
