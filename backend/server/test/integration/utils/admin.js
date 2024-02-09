var config = require('../../../config/config');

exports.admin = {
    "username": config.get('test.admin.username'),
    "password": config.get('test.admin.password')
};