/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const EstablishmentServiceUsers = sequelize.define('establishmentServiceUsers', {
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: '"EstablishmentID"'
    },
    serviceUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: '"ServiceUserID"'
    },
    other: {
      type: DataTypes.TEXT,
      allowNull: true,
      primaryKey: false,
      field: '"Other"'
    }
  }, {
    tableName: '"EstablishmentServiceUsers"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  return EstablishmentServiceUsers;
};
