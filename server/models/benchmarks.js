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
    pay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "Pay"
    },
    sickness: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "Sickness"
    },
    turnover: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "Turnover"
    },
    qualifications: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: "Qualifications"
    },
    workplaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "Workplaces"
    },
    staff: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "Staff"

    }},{
    tableName: '"Benchmarks"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });
  Benchmarks.associate = (models) => {
    Benchmarks.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as:"BenchmarkToService"
    });
  };

  return Benchmarks;
};
