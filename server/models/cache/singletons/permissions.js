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
    },
    {
      code: 'canAddWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canBulkUpload',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canChangePermissionsForSubsidiary',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canDeleteEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canDeleteUser',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canDeleteWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canEditUser',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canEditWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canMoveWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canOrderEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canOrderWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    }
    {
      code: 'canViewEstablishment',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canViewKeyFacts',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canViewLastUpdatedTime',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canViewNotifications',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canViewWdfReport',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canViewWorker',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace and staff'],
      role: ['Read', 'Edit']
    },
    {
      code: 'canViewWorkerStatus',
      description: '',
      dataOwner : 'parent',
      dataPermissions: ['Workplace', 'Workplace and staff'],
      role: ['Read', 'Edit']
    }
];

class PermissionCache {
  constructor() {}

  static async initialize() {

  }

  static myPermissions(dataOwner, dataPermissions, role){
    return ALL_PERMISSIONS
        .filter(x => 
            (!x.dataOwner.length || dataOwner.toLowerCase() == x.dataOwner.toLowerCase()) ||
            (!x.dataPermissions.length || x.dataPermissions.includes(dataPermissions)) ||
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
