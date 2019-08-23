const AppConfig = require('../../../config/appConfig');

let ALL_PERMISSIONS = [
  {
    code: 'canAddUser',
    description: 'add a user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canAddEstablishment',
    description: 'add establishment - PARENT CAN ADD A SUB AT ANY TIME OWNERSHIP AUTOMATIC',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canAddWorker',
    description: 'add a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canBulkUpload',
    description: 'bulk upload',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canChangePermissionsForSubsidiary',
    description: 'change permissions for subsidiary views',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canDeleteEstablishment',
    description: 'delete an establishment',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canDeleteUser',
    description: 'delete an user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canDeleteWorker',
    description: 'delete a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canEditUser',
    description: 'edit a user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canEditWorker',
    description: 'edit a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canViewEstablishment',
    description: 'view establishment',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and staff','Workplace'],
  },
  {
    code: 'canViewWdfReport',
    description: 'WDF report',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and staff','Workplace'],
  },
  {
    code: 'canViewWorker',
    description: 'view worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff'],
    subOwnedByParentAccessBySub: ['Workplace and staff'],
  },
  {
    code: 'canCountWorkers',
    description: 'For WDF report, ability to show the staff count (grey bar)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and staff','Workplace'],
  },
  {
    code: 'canViewVisuals',
    description: 'NEW yet to be built - Data Visualisation and key facts (total staff, total leavers, total starters/total establishment/staff turnover rate)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and staff','Workplace'],
  },
  {
    code: 'canViewLastUpdateTime',
    description: 'NEW yet to be built - Data Visualisation and key facts (total staff, total leavers, total starters/total establishment/staff turnover rate)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and staff','Workplace'],
  },
  {
    code: 'canViewNotifications',
    description: 'NEW yet to be built - notifications area',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canSortEstablishments',
    description: 'NEW yet to be built - order establishment (alphabetical/size etc)',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canSortWorkers',
    description: 'NEW yet to be built - order establishment (alphabetical/size etc)',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff'],
    subOwnedByParentAccessBySub: ['Workplace and staff'],
  },
  {
    code: 'canTransferWorker',
    description: 'NEW yet to be built - move workers between subsidiaries',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canViewListOfWorkers',
    description: 'View list of workers',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and staff'],
    subOwnedByParentAccessBySub: ['Workplace and staff'],
  },
];

class PermissionCache {
  constructor() {}

  static async initialize() {

  }

  static myPermissions(requestData){

    let estabType = this.getEstablishmentType(requestData);
    let permissions = [];

    if(estabType == "Standalone") {
      permissions = this.filterByRole(requestData.role);
    }else if(estabType == "Subsidiary" && this.getParentOwnerStatus(requestData.parentIsOwner) == 'Workplace') {
      permissions = this.filterByRole(requestData.role);
    }else if(estabType == "Subsidiary" && this.getParentOwnerStatus(requestData.parentIsOwner) == 'Parent') {
      permissions = this.filterBysubOwnedByWorkplace(requestData.dataPermissions);
    }else if(estabType == "Parent" && this.getEstablishmentStatus(requestData.establishment, requestData.param.id) == 'Primary') { 
      permissions = this.filterByRole(requestData.role);
    } else if(estabType == "Parent" && this.getEstablishmentStatus(requestData.establishment, requestData.param.id) == 'Subsidiary') {
      permissions = this.filterBySubOwnedByParent(requestData.dataPermissions);
    }

    return permissions.map(thisPerm => {
            return {
                code: thisPerm.code,
                description: thisPerm.description,
                role: thisPerm.role
        };
    });
  }
  
  static filterByRole(role){
    return ALL_PERMISSIONS
    .filter(x => 
        (role == "Edit" && x.role.includes("Edit") || x.role.includes("Read")) ||
        x.role.includes(role)
    );
  }

  static filterBysubOwnedByWorkplace(dataPermissions){
    return ALL_PERMISSIONS
    .filter(x => x.subOwnedByWorkplaceAccessByParent.includes(dataPermissions));    
  }

  static filterBySubOwnedByParent(dataPermissions){
    return ALL_PERMISSIONS
    .filter(x => x.subOwnedByParentAccessBySub.includes(dataPermissions));    
  }

  static getRoleEnum(role){
    return (role == 'Edit' || role == 'Admin') ? "Edit" : "Read";
  }

  static getEstablishmentStatus(establishment, id){
     return (id !== establishment.id) ? "Subsidiary" : "Primary";
  }

  static getDataPermissions(dataPermissions){
    return dataPermissions;
  }

  static getParentOwnerStatus(parentIsOwner){
    return parentIsOwner ? "Parent" : "Workplace";
  }

  static getEstablishmentType(establishment){
    if(establishment.isSubsidiary){
      return "Subsidiary";
    }else if(establishment.isParent){
      return "Parent";
    }else if(!establishment.isSubsidiary && !establishment.isParent){
      return "Standalone";
    }
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
