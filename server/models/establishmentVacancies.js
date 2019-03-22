/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const EstablishmentVacancies = sequelize.define('establishmentVacancies', {
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
      values: ['Vacancies'],
      default: 'Vacancies',
      field: '"JobType"'
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"Total"'
    }
  }, {
    tableName: '"VacanciesVW"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  EstablishmentVacancies.associate = (models) => {
    EstablishmentVacancies.belongsTo(models.job, {
      foreignKey: 'jobId',
      targetKey: 'id',
      as: 'reference'
    });
  };

  return EstablishmentVacancies;
};
