module.exports = function(sequelize, DataTypes) {
  const Benchmarks = sequelize.define('benchmarks', {
    CssrID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    MainServiceFK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Pay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Sickness: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Turnover: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    Qualifications: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    Workplaces: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Staff: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tableName: 'Benchmarks',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });
  Benchmarks.associate = (models) => {
    Benchmarks.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as: 'mainService'
    });
  };

  return Benchmarks;
};
