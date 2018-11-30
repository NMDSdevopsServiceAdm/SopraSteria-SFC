/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('services', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    capacityquestion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currentuptakequestion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iscqcregistered: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'services',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });
};
