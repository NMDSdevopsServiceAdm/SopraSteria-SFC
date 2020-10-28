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
    },
    payGoodCQC: {
    type: DataTypes.INTEGER,
      allowNull: true,
      field: "PayGoodCQC"
  },
    payLowTurnover: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "PayLowTurnover"
    },
    sicknessGoodCQC:{
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "SicknessGoodCQC"
    },
    sicknessLowTurnover: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "SicknessLowTurnover"
    },
    turnoverGoodCQC:{
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "TurnoverGoodCQC"
    },
    turnoverLowTurnover:{
      type:  DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "TurnoverLowTurnover"
    },
    qualificationsGoodCQC:{
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: "QualificationsGoodCQC"
    },
    qualificationsLowTurnover:{
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: "QualificationsLowTurnover"
    }
  },{
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
