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
    if (item.type === "attributeset") {
      context.attributelist = item.system.attributes.map( 
        (attribute) => { return attribute.name;}
      ).join('\n');
    }
    return context;
  }  

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#itemname").change(this._onNameChange.bind(this));
    html.find("#attributes").change(this._onAttributesChange.bind(this));
    html.find("#skillgroup").change(this._onSkillGroupChange.bind(this));
    html.find("#odf").change(this._onNumberFieldChange.bind(this));
    html.find("#ddf").change(this._onNumberFieldChange.bind(this));
    html.find("#quantity").change(this._onNumberFieldChange.bind(this));
  }

  async _onNameChange(event) {
    await this.object.update({name: event.target.value.trim()});
  }

  async _onAttributesChange(event) {
    let newAttributeNames = event.target.value.split("\n");
    let newAttributes = []
    for (let name of newAttributeNames) {
      let cleanName = name.trim();
      if ( cleanName !== "") {
        const attribute = { name: cleanName, level: 0 };
        let oldAttribute = this.object.system.attributes.find ( 
          (attribute) => attribute.name.toLowerCase() === cleanName.toLowerCase() );
        if (oldAttribute) {
          attribute.level = oldAttribute.level;
        }
        newAttributes.push(attribute);
      }
    }
    await this.object.update( {"system.attributes": newAttributes })
  }

  async _onSkillGroupChange(event) {
    await this.object.update({"system.group": event.target.value.trim()});
  }

  async _onNumberFieldChange(event) {
    const result = parseInt(event.target.value);
    const score = event.target.id;
    if (isNaN(result)) {
      event.target.value = this.object.system[score].toString();
    } else {
      const updates = {};
      updates[`system.${score}`] = result;
      await this.object.update(updates);  
    }
  }


}