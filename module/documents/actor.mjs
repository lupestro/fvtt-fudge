
/* Extend the base Actor class to implement additional system-specific logic. */

export default class ActorFudge extends Actor {

  /** @inheritdoc */
  // This gets called before the new item gets created, so for unique items, we can remove the old one first.
  async _onCreateEmbeddedDocuments(embeddedName, items, ...args) {
    const allOldUniqueIds = [];
    // Ensure replacement rather than addition of attribute sets and trait level sets by removing old before adding new
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
      }
    }
    if (allOldUniqueIds.length > 0) {
      await this.deleteEmbeddedDocuments("Item", allOldUniqueIds);
    }
    await super._onCreateEmbeddedDocuments(embeddedName, items, ...args);
  }
}
