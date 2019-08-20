const AppConfig = require('../../../config/appConfig');

let ALL_PERMISSIONS = [
    {
      code: 'canAddUser',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canAddEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canAddWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canBulkUpload',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canChangePermissionsForSubsidiary',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canDeleteEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canDeleteUser',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canDeleteWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canEditUser',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canEditWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: [],
      role: ['Edit']
    },
    {
      code: 'canViewEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read']
    },
    {
      code: 'canViewWdfReport',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff', 'None'],
      role: ['Read']
    },
    {
      code: 'canViewWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace and staff'],
      role: ['Read']
    },
    {
      code: 'canViewWorkerStatus',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace and staff'],
      role: ['Read']
    }
];

class PermissionCache {
  constructor() {}

  static async initialize() {

  }

  static myPermissions(dataOwner, dataPermissions, role){
    return ALL_PERMISSIONS
        .filter((x) => {
          return (
            (!x.dataOwner.length || dataOwner.toLowerCase() == x.dataOwner.toLowerCase()) ||
            ( dataOwner.toLowerCase() !== 'parent' && x.dataPermissions.includes(dataPermissions)) ||
            ( (role == 'Edit' && (x.role.includes('Edit') || x.role.includes('Read'))) || x.role.includes(role))) 
          }
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
