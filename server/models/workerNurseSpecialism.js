/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Specialisms =  sequelize.define('workerNurseSpecialism', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
      field: '"ID"'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'Seq'
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Specialism"'
    },
  }, {
    tableName: 'NurseSpecialism',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  return Specialisms;
};
