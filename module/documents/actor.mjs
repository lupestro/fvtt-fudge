/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
 export default class ActorFudge extends Actor {
  /** @inheritdoc */
  // This gets called before the new item gets created, so for unique items, we can remove the old one first.
  async _onCreateEmbeddedDocuments(embeddedName, items, ...args) {
    for (let item of items) {
      if (item.type === "attributeset") {
        let currentsets = this.items.filter((item) => item.type === "attributeset");
        let oldids = currentsets
          .filter((attrset) => attrset.id != item.id)
          .map((attrset) => attrset.id);
        if (oldids.length > 0) {
          await this.deleteEmbeddedDocuments("Item", oldids);
        }
      } else if (item.type === "traitlevelset") {
        let currentsets = this.items.filter((item) => item.type === "traitlevelset");
        let oldids = currentsets
          .filter((attrset) => attrset.id != item.id)
          .map((attrset) => attrset.id);
        if (oldids.length > 0) {
          await this.deleteEmbeddedDocuments("Item", oldids);
        }
      }
    }
    await super._onCreateEmbeddedDocuments(embeddedName, items, ...args);
  }
}
