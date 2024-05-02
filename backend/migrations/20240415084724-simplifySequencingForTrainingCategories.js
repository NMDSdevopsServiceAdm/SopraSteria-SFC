'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 0;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 1
          WHERE "ID" = 37;`,
          { transaction },
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 10
          WHERE "ID" = 1;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 20
          WHERE "ID" = 2;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 30
          WHERE "ID" = 3;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 40
          WHERE "ID" = 4;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 50
          WHERE "ID" = 5;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 60
          WHERE "ID" = 6;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 70
          WHERE "ID" = 7;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 80
          WHERE "ID" = 8;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 90
          WHERE "ID" = 9;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 100
          WHERE "ID" = 10;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 110
          WHERE "ID" = 11;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 120
          WHERE "ID" = 12;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 130
          WHERE "ID" = 13;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 140
          WHERE "ID" = 14;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 150
          WHERE "ID" = 15;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 160
          WHERE "ID" = 16;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 170
          WHERE "ID" = 17;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 180
          WHERE "ID" = 18;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 190
          WHERE "ID" = 19;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 200
          WHERE "ID" = 20;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 210
          WHERE "ID" = 21;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 220
          WHERE "ID" = 22;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 230
          WHERE "ID" = 23;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 240
          WHERE "ID" = 24;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 250
          WHERE "ID" = 25;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 260
          WHERE "ID" = 26;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 270
          WHERE "ID" = 27;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 280
          WHERE "ID" = 28;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 290
          WHERE "ID" = 29;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 300
          WHERE "ID" = 30;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 310
          WHERE "ID" = 31;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 320
          WHERE "ID" = 32;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 330
          WHERE "ID" = 33;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 340
          WHERE "ID" = 34;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 350
          WHERE "ID" = 35;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 360
          WHERE "ID" = 36;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 370
          WHERE "ID" = 37;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 284
          WHERE "ID" = 38;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 285
          WHERE "ID" = 39;`,
          { transaction },
        ),
        queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Seq" = 286
          WHERE "ID" = 40;`,
          { transaction },
        ),
      ]);
    });
  },
};
