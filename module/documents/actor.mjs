/* Extend the base Actor class to implement additional system-specific logic. */
import FivePointCache from "../five-point-cache.mjs";

const DEFAULT_WOUND_MAX = {
  "scratch": 3,
  "hurt": 2, 
  "veryhurt": 1, 
  "incapacitated": 1, 
  "neardeath": 1
};

const sortByName = function (first, second) {
  if (first.name < second.name) {
    return -1;
  } else if (first.name > second.name) {
    return 1;
  } 
  return 0;
};

export default class ActorFudge extends Actor {

  // -------- Overrides --------

  static migrateData(data) {
    // Deal with naming changes when we moved to data models
    if (data.type === "major") {
      data.type = "character";
    }
    if (data.system && data.system.fivePoint) {
      if (data.system.fivePoint.generalGroups) {
        data.system.fivePoint.generalgroups = data.system.fivePoint.generalGroups;
        delete data.system.fivePoint.generalGroups;
      }
      data.system.fivepoint = data.system.fivePoint;
      delete data.system.fivePoint;
    }
    Object.entries(DEFAULT_WOUND_MAX).forEach(([level,max]) => {
      if (data.system && data.system.wounds && data.system.wounds[level]) {
        if (typeof data.system.wounds[level] === "number") {
          data.system.wounds[level] = {value: data.system.wounds[level], max};
        }
        if (
          typeof data.system.wounds[level].max === "undefined" ||
          data.system.wounds[level].max === 0
        ) {
          data.system.wounds[level].max = max;
        }
      }
    });
    return super.migrateData(data);
  }

  /** @inheritdoc */
  prepareDerivedData() {
    this.system.fivePointCache = new FivePointCache(this.system.fivepoint);
  }

  /** @inheritdoc */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
    const updates = {
      "system.unspent.skilllevels": 
        game.settings.get("fudge-rpg", "initialskilllevels"),
      "system.unspent.attrlevels": 
        game.settings.get("fudge-rpg", "initialattrlevels"),
      "system.unspent.gifts": 
        game.settings.get("fudge-rpg", "initialgifts")
    };
    const attrsetid = game.settings.get("fudge-rpg", "defaultattributeset");
    const attributeset = await foundry.utils.fromUuid(attrsetid);
    if (attributeset) {
      updates.items = [attributeset.toObject()];
    }
    this.updateSource(updates);
  }

  /** @inheritdoc */
  /* 
   * This gets called before the new item gets created, so for unique items, 
   * we can remove the old one first. Also tracks gifts and faults against 
   * the allotted numbers, but doesn't enforce limits.
   */
  /* eslint-disable-next-line max-params, max-lines-per-function */
  async _onCreateDescendantDocuments(parent, collection, items, data, options, userId) {
    const allOldUniqueIds = [];
    let giftCount = 0;
    let faultCount = 0;

    /*
     * Ensure replacement rather than addition of attribute sets  
     * and trait level sets by removing old before adding new.
     * Determine how many gifts and faults are being added
     */
    for (const item of items) {
      if (item.type === "attributeset") {
        const currentsets = 
          this.items.filter((attrsetItem) => attrsetItem.type === "attributeset");
        const oldids = currentsets
          .filter((attrset) => attrset.id !== item.id)
          .map((attrset) => attrset.id);
        allOldUniqueIds.push(...oldids);
      } else if (item.type === "traitladder") {
        const currentladders = 
          this.items.filter((traitsetItem) => traitsetItem.type === "traitladder");
        const oldids = currentladders
          .filter((traitset) => traitset.id !== item.id)
          .map((traitset) => traitset.id);
          allOldUniqueIds.push(...oldids);
      } else if (item.type === "gift") {
        giftCount += 1;
      } else if (item.type === "fault") {
        faultCount += 1;
      }
    }
    
    /* 
     * Now we're out of the loop, do the business end of things - 
     * * Apply the gifts against the allotment
     * * Use the faults to augment the allotment
     * * Remove any existing sets of trait levels and attribute sets 
     *   applied to the character
     */
    if (giftCount > 0) {
      await this.update({
        "system.unspent.gifts": this.system.unspent.gifts - giftCount
      });
    }
    if (faultCount > 0) {
      await this.update({
        "system.unspent.faults": this.system.unspent.faults + faultCount
      });
    }
    if (allOldUniqueIds.length > 0) {
      await this.deleteEmbeddedDocuments("Item", allOldUniqueIds);
    }
    await super._onCreateDescendantDocuments(parent, collection, items, data, options, userId);
  }

  // -------- Public methods -------- 

  refreshFivePointCache() {
    this.system.fivePointCache = new FivePointCache(this.system.fivepoint);
  }

  async updateFivePointFromCache() {
    await this.update({
      "system.fivepoint.unspent": this.system.fivePointCache.unspent,
      "system.fivepoint.groups": this.system.fivePointCache.groups,
      "system.fivepoint.generalgroups": this.system.fivePointCache.generalgroups
    });
  }

  async applyFivePoint(cache) {
    await this.replaceSkills(cache.getSkillItems());
    await this.updateFivePointFromCache();
  }

  async replaceSkills(newSkills) {
    // First get rid of the old skills
    const currentSkillIds = 
      this.items.filter((item) => item.type === "skill").map((item) => item.id);
    await this.deleteEmbeddedDocuments("Item", currentSkillIds);

    const uuids = Object.entries(newSkills).map(([, value]) => value.uuid);
    const newSkillDocs = await Promise.all(uuids.map((uuid) => foundry.utils.fromUuid(uuid)));
    newSkillDocs.sort(sortByName);
    const docs = await this.createEmbeddedDocuments("Item", newSkillDocs);

    /* 
     * Then update the embedded items with the skill levels chosen - 
     * docs has different ids than newSkillDocs
     */
    const updates = [];
    let sortOrder = 0;
    for (const doc of docs) {
        updates.push({
          _id: doc._id, 
          "system.level": newSkills[doc.name].level, 
          "sort": sortOrder
        });
        sortOrder += 1;
    }
    await this.updateEmbeddedDocuments("Item", updates);
  }
}
