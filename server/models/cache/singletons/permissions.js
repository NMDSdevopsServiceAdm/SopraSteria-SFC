const AppConfig = require('../../../config/appConfig');

let ALL_PERMISSIONS = [
    {
      code: 'canAddUser',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canAddEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    }
];

class PermissionCache {
  constructor() {}

  static async initialize() {

  }

  static myPermission(dataOwner, dataPermissions, role){
    return ALL_PERMISSIONS
        .filter(x => 
            (!x.dataOwner.length || dataOwner.toLowerCase() == x.dataOwner.toLowerCase()) && 
            (!x.dataPermissions.length || x.dataPermissions.includes(dataPermissions)) &&
            (!x.role.length || x.role.includes(role))   
        )
        .map(thisPerm => {
            return {
                code: thisPerm.code,
                description: thisPerm.description,
                dataOwner: thisPerm.dataOwner,
                dataPermissions: thisPerm.dataPermissions,
                role: thisPerm.role
            };
        });
    }
}

if (AppConfig.ready) {
    PermissionCache.initialize()
    .then()
    .catch(err => {
      console.error("Failed to initialise PermissionCache: ", err);
    });
} else {
    AppConfig.on(AppConfig.READY_EVENT, () => {
        PermissionCache.initialize()
        .then()
        .catch(err => {
          console.error("Failed to initialise PermissionCache: ", err);
        });        
    });
}  

exports.PermissionCache = PermissionCache;
