export default class ItemSheetFudge extends ItemSheet {
  get template() {
    return "systems/fudge/templates/item.hbs";
  }
  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const item = context.item;
    foundry.utils.mergeObject(context, {
      descriptionHTML: await TextEditor.enrichHTML(item.system.description, {
        secrets: item.isOwner,
        async: true,
        relativeTo: this.item
      }),
    });
    return context;
  }  
}