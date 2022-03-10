module.exports = function (sequelize, DataTypes) {
  const Notes = sequelize.define(
    'notes',
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
      noteType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Registration', 'Parent Request', 'Main Service'],
        field: 'NoteType',
      }
    },
    {
      tableName: 'Notes',
      schema: 'cqc',
      updatedAt: false,
    },
  );

  Notes.associate = (models) => {
    Notes.belongsTo(models.user, {
      foreignKey: 'userFk',
      targetKey: 'id',
      as: 'user',
    });

    Notes.belongsTo(models.establishment, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'establishment'
    });
  };

  Notes.createNote = function (userId, establishmentId, note, noteType) {
    return this.create({
      userFk: userId,
      establishmentFk: establishmentId,
      note,
      noteType,
    });
  };

  Notes.getNotesByEstablishmentId = function (establishmentId) {
    return this.findAll({
      where: {
        establishmentFk: establishmentId
      },
      attributes: ['note', 'createdAt', 'noteType'],
      include: [
        {
          model: sequelize.models.user,
          attributes: ['FullNameValue'],
          as: 'user',
        }
      ]
    })
  }

  return Notes;
};
