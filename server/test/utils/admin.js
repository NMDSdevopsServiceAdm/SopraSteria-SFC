exports.admin = process.env.adminuser && process.env.adminpass ? {"username": process.env.adminuser, "password": process.env.adminpass } : {"username": "unknown", "password": "unknown"};
