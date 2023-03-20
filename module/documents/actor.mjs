
/* Extend the base Actor class to implement additional system-specific logic. */


export default class ActorFudge extends Actor {

  /** @inheritdoc */
  async prepareDerivedData() {
    this._prepareTraitLevels();
    await this._prepareGroupSkills();
    this._prepareFivePointGroups();
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

  async _prepareGroupSkills() {
    const result = {};
    for (const pack of game.packs) {  
      if (pack.metadata.type === "Item") {
        const skills = pack.index.filter((item) => item.type === "skill")
        for (const skill of skills ){
          const item = await pack.getDocument(skill._id);
          if (item) {
            if (item.system.group) {
                if (!(item.system.group in result)) {
                result[item.system.group] = [item.name];
              } else {
                result[item.system.group].push(item.name);
              }
            }
            if (item.system.group2) {
              if (!(item.system.group2 in result)) {
                result[item.system.group2] = [item.name];
              } else {
                result[item.system.group2].push(item.name);
              }
            }
          }
        }
      }
    }
    this.system.groupSkills = result;
  }

  _getTraitLevelName(value) {
    return this.system.traitlevels.find(level => level.value === value).name;
  }

  _prepareFivePointGroups() {

    const result = [];
    for (let group in this.system.groupSkills) {
      result.push ({
        name: group,
        points: 0,
        levels: []
      });
    }
    this.system.fivePoint = {
      unspent: 5,
      generalPoints: 0,
      generalGroups: ["Social","Covert"],
      groups: result
    };

    // HACK: Provide some canned data until we can build it with the GUI
    this.system.fivePoint.groups[0].levels.push({
      name: "Acrobatics/Tumbling",
      level: this._getTraitLevelName(2)
    },{
      name: "",
      level: this._getTraitLevelName(2)
    },{
      name: "Equestrian Acrobatics",
      level: this._getTraitLevelName(1)
    },{
      name: "",
      level: this._getTraitLevelName(1)
    });
  
  }

}
