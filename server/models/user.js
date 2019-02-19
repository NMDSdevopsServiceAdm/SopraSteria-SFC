/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"RegistrationID"'
    },
    fullname: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      field: '"FullName"'
    },
    jobTitle: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"JobTitle"'
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "Email"
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Phone"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      field: '"DateCreated"'
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentID"'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"AdminUser"'
    }
  }, {
    tableName: '"User"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  User.associate = (models) => {
    User.belongsTo(models.establishment, {
      foreignKey : 'establishmentId',
      targetKey: 'id'
    });
    User.hasOne(models.login, {
      foreignKey : 'id',
      targetKey: 'registrationId'
    });
  };
  return User;
};
