module.exports = function (sequelize, DataTypes) {
  const RegistrationNotes = sequelize.define(
    'registrationNodes',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      userFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'UserFK',
      },
      establishmentFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'EstablishmentFK',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Notes',
      },
    },
    {
      tableName: 'RegistrationNotes',
      schema: 'cqc',
      updatedAt: false,
    },
  );

  RegistrationNotes.associate = (models) => {
    RegistrationNotes.belongsTo(models.user, {
      foreignKey: 'userFk',
      targetKey: 'id',
      as: 'User',
    });

    RegistrationNotes.belongsTo(models.user, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'Establishment',
    });
  };

  return RegistrationNotes;
};
