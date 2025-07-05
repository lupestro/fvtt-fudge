/**
 * Extend the base Item class to implement additional system-specific logic.
 */
export default class ItemFudge extends Item {
    static migrateData(data) {
      // Deal with naming changes when we moved to data models
      if (data.system && data.system.group) {
         if (data.system.group2) {
            data.system.groups = [data.system.group, data.system.group2];
            delete data.system.group;
            delete data.system.group2;
         } else {
            data.system.groups = [data.system.group];
            delete data.system.group;
         }
      }
      return super.migrateData(data);
    }  
}
