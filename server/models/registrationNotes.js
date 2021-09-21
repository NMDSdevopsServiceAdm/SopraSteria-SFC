module.exports = function (sequelize, DataTypes) {
  const RegistrationNotes = sequelize.define(
    'registrationNotes',
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
      note: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Note',
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
      as: 'user',
    });

    RegistrationNotes.belongsTo(models.establishment, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'establishment'
    });
  };

  RegistrationNotes.createNote = function (userId, establishmentId, note) {
    return this.create({
      userFk: userId,
      establishmentFk: establishmentId,
      note: note,
    });
  };

  RegistrationNotes.getNotesByEstablishmentId = function (establishmentId) {
    return this.findAll({
      where: {
        establishmentFk: establishmentId
      },
      attributes: ['note','createdAt'],
      include: [
        {
          model: sequelize.models.user,
          attributes: ['FullNameValue'],
          as: 'user',
        }
      ]
    })
  }

  return RegistrationNotes;
};
