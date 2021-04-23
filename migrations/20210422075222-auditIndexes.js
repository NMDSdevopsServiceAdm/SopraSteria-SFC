'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY "worker_audit__worker_f_k__property_name__event_type__when" ON cqc."WorkerAudit" USING btree ("WorkerFK", "EventType", "When");
      CREATE INDEX CONCURRENTLY "establishment_audit__establishment_f_k__when" ON cqc."EstablishmentAudit" USING btree ("EstablishmentFK", "When");
      CREATE INDEX CONCURRENTLY "worker_audit__worker_f_k__when" ON cqc."WorkerAudit" USING btree ("WorkerFK", "When");
      CREATE INDEX CONCURRENTLY "user_audit__user_f_k__event_type__when" ON cqc."UserAudit" USING btree ("UserFK", "EventType", "When");
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS cqc."worker_audit__worker_f_k__property_name__event_type__when";
      DROP INDEX IF EXISTS cqc."establishment_audit__establishment_f_k__when";
	    DROP INDEX IF EXISTS cqc."worker_audit__worker_f_k__when";
    `);
  },
};
