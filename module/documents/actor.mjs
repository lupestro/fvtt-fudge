/* Extend the base Actor class to implement additional system-specific logic. */
import FivePointFudgeDoc from "./five-point.mjs";

export default class ActorFudge extends Actor {

  /** @inheritdoc */
  prepareDerivedData() {
    this._prepareTraitLevels();
    this._prepareFivePoint();
  }

  /** @inheritdoc */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
    this.updateSource({
      "system.unspent.skilllevels": game.settings.get("fudge-rpg", "initialskilllevels"),
      "system.unspent.attrlevels": game.settings.get("fudge-rpg", "initialattrlevels"),
      "system.unspent.gifts": game.settings.get("fudge-rpg", "initialgifts")
    });
    const attributeset = await this._findAttributes(game.settings.get("fudge-rpg", "defaultattributeset"));
    if (attributeset) {
      await this.items.update([attributeset]);
    }
  }

  /** @inheritdoc */
  /* 
   * This gets called before the new item gets created, so for unique items, we can remove the old one first.
   * Also tracks gifts and faults against the allotted numbers, but doesn't enforce limits.
   */
  async _onCreateEmbeddedDocuments(embeddedName, items, ...args) {
    const allOldUniqueIds = [];
    let giftCount = 0;
    let faultCount = 0;

    /*
     * Ensure replacement rather than addition of attribute sets and trait level sets by removing old before adding new
     * Determine how many gifts and faults are being added
     */
    for (const item of items) {
      if (item.type === "attributeset") {
        const currentsets = this.items.filter((attrsetItem) => attrsetItem.type === "attributeset");
        const oldids = currentsets
          .filter((attrset) => attrset.id !== item.id)
          .map((attrset) => attrset.id);
        allOldUniqueIds.push(...oldids);
      } else if (item.type === "traitlevelset") {
        const currentsets = this.items.filter((traitsetItem) => traitsetItem.type === "traitlevelset");
        const oldids = currentsets
          .filter((attrset) => attrset.id !== item.id)
          .map((attrset) => attrset.id);
          allOldUniqueIds.push(...oldids);
      } else if (item.type === "gift") {
        giftCount += 1;
      } else if (item.type === "fault") {
        faultCount += 1;
      }
    }
    
    /* 
     * Now we're out of the loop, do the business end of things - 
     * * Apply the gifts against the allotment, and use the faults to augment the allotment
     * * Remove any existing sets of trait levels and attribute sets applied to the character
     */
    if (giftCount > 0) {
      await this.update({"system.unspent.gifts": this.system.unspent.gifts - giftCount});
    }
    if (faultCount > 0) {
      await this.update({"system.unspent.faults": this.system.unspent.faults + faultCount});
    }
    if (allOldUniqueIds.length > 0) {
      await this.deleteEmbeddedDocuments("Item", allOldUniqueIds);
    }
    await super._onCreateEmbeddedDocuments(embeddedName, items, ...args);
  }

  // Utility methods
  async _findAttributes(id) {
    let result = game.collections.get("Item").find((item) => item._id === id);
    if (!result) {
      // Find which pack (if any) the configured id is in
      const pack = game.packs.find((aPack) => aPack.index.find((item) => item._id === id));
      if (pack) {
        result = await pack.getDocument(id);
      }
    }
    return result;
  }
  
  _prepareTraitLevels() {
    this.system.traitlevels = [
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Superb"), value: +3}, // eslint-disable-line no-magic-numbers
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Great"), value: +2}, // eslint-disable-line no-magic-numbers
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Good"), value: +1},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Fair"), value: 0},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Mediocre"), value: -1},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Poor"), value: -2},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Terrible"), value: -3}
    ];
    if (game.settings.get("fudge-rpg", "traitlevels") === "extended") {
      this.system.traitlevels.unshift(
        {name: game.i18n.localize("FUDGERPG.TraitLevel.Legendary"), value: +5}, // eslint-disable-line no-magic-numbers
        {name: game.i18n.localize("FUDGERPG.TraitLevel.Heroic"), value: +4} // eslint-disable-line no-magic-numbers
      );
    }
  }

  _prepareFivePoint() {
    this.system.fivePoint = new FivePointFudgeDoc(this.system.fivePoint);
  }

  getTraitLevelName(value) {
    return this.system.traitlevels.find((level) => level.value === value).name;
  }

  async replaceSkills(newSkills) {
    // First get rid of the old skills
    const currentSkillIds = this.items.filter((item) => item.type === "skill").map((item) => item.id);
    await this.deleteEmbeddedDocuments("Item", currentSkillIds);
    const newSkillDocs = [];
    // Then build the new skill list straight from the data in the pack
    for (const skill in newSkills) {
      if (Object.prototype.hasOwnProperty.call(newSkills, skill)) {
        if (newSkills[skill].pack) {
          // eslint-disable-next-line no-await-in-loop
          const newSkillDoc = await newSkills[skill].pack.getDocument(newSkills[skill].id);
          newSkillDocs.push(newSkillDoc);
        } else {
          const newSkillDoc = game.items.find((item) => item.type === "skill" && item.name === skill);
          if (newSkillDoc) {
            newSkillDocs.push(newSkillDoc);
          }
        }
      }
    }
    newSkillDocs.sort((first, second) => (first.name < second.name ? -1 : first.name > second.name ? 1 : 0));
    const docs = await this.createEmbeddedDocuments("Item", newSkillDocs);
    // Then update the embedded items with the skill levels chosen - docs has different ids than newSkillDocs
    const updates = [];
    let sortOrder = 0;
    for (const doc of docs) {
        updates.push({_id: doc.id, "system.level": newSkills[doc.name].level, "sort": sortOrder});
        sortOrder += 1;
    }
    await this.updateEmbeddedDocuments("Item", updates);
  }
}
