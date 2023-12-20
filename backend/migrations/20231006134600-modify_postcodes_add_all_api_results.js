'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "thoroughfare" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "building_name" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "sub_building_name" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "sub_building_number" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "building_number" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "line_1" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "line_2" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "line_3" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "line_4" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "locality" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "town_or_city" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "county" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "district" VARCHAR(255)',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TABLE cqcref."postcodes" ADD COLUMN IF NOT EXISTS "country" VARCHAR(255)',
          {
            transaction,
          },
        ),
      ]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "thoroughfare"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "building_name"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "sub_building_name"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "sub_building_number"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "building_number"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "line_1"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "line_2"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "line_3"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "line_4"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "locality"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "town_or_city"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "county"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "district"', {
          transaction,
        }),
        queryInterface.sequelize.query('ALTER TABLE cqcref."postcodes" DROP COLUMN IF EXISTS "country"', {
          transaction,
        }),
      ]);
    });
  },
};
