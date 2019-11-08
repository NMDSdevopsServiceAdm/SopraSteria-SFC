var config = require('../../../config/config');

exports.baseurl = config.get('test.baseurl') + ':' + config.get('listen.port') + '/api';