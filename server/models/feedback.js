/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Feedback = sequelize.define(
    'feedback',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"FeedbackID"',
      },
      doingWhat: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Doing"',
      },
      tellUs: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Tellus"',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Name"',
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Email"',
      },
    },
    {
      tableName: '"Feedback"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return Feedback;
};
