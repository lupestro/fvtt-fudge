const VersionNeutralItemSheet = foundry.appv1?.sheets.ItemSheet ? foundry.appv1.sheets.ItemSheet : ItemSheet;
const VersionNeutralTextEditor = foundry.applications?.ux?.TextEditor.implementation 
  ? foundry.applications.ux.TextEditor.implementation 
  : TextEditor;
  
export default class ItemSheetFudge extends VersionNeutralItemSheet {

  static _warnedAppV1 = true;
  
  // -------- Overrides --------

  get template() {
    return "systems/fudge-rpg/templates/item.hbs";
  }

  async getData(options) {
    const context = await super.getData(options);
    const {item} = context;
    foundry.utils.mergeObject(context, {
      descriptionHTML: await VersionNeutralTextEditor.enrichHTML(item.system.description, {async: true})
    });
    if (item.type === "attributeset") {
      context.attributelist = item.system.attributes.map((attribute) => attribute.name).join("\n");
    }
    if (item.type === "traitladder") {
      context.traitlist = item.system.traits.map((trait) => `${trait.name}: ${trait.value}`).join("\n");
    }
    if (this.object.system.groups) {
      // Only applies to skills
      item.group = this.object.system.groups.length ? this.object.system.groups[0] : "";
      item.group2 = this.object.system.groups.length > 1 ? this.object.system.groups[1] : "";  
    }
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#itemname").change(this._onNameChange.bind(this));
    html.find("#traits").change(this._onLadderChange.bind(this));
    html.find("#attributes").change(this._onAttributesChange.bind(this));
    html.find("#muscleweapon").change(this._onMuscleWeaponAttributeChange.bind(this));
    html.find("#damagecapacity").change(this._onDamageCapacityAttributeChange.bind(this));
    html.find("#skillgroup").change(this._onSkillGroupChange.bind(this));
    html.find("#skillgroup2").change(this._onSkillGroup2Change.bind(this));
    html.find("#odf").change(this._onNumberFieldChange.bind(this));
    html.find("#ddf").change(this._onNumberFieldChange.bind(this));
    html.find("#quantity").change(this._onNumberFieldChange.bind(this));
  }

  // -------- Event Listeners --------

  async _onNameChange(event) {
    await this.object.update({name: event.target.value.trim()});
  }

  async _onAttributesChange(event) {
    const newAttributeNames = event.target.value.split("\n");
    const newAttributes = [];
    for (const name of newAttributeNames) {
      const cleanName = name.trim();
      if ( cleanName !== "") {
        const attribute = {name: cleanName, level: 0};
        const oldAttribute = this.object.system.attributes
          .find( (attr) => attr.name.toLowerCase() === cleanName.toLowerCase());
        if (oldAttribute) {
          attribute.level = oldAttribute.level;
        }
        newAttributes.push(attribute);
      }
    }
    await this.object.update( {"system.attributes": newAttributes});
  }
  
  async _onLadderChange(event) {
    const rows = event.target.value.split("\n");
    const newTraits = [];
    for (const traitRow of rows) {
      const traitData = traitRow.split(":");
      if (traitData.length === 2) {
        const cleanName = traitData[0].trim();
        const cleanValue = traitData[1].trim();
        if (cleanName !== "" && cleanValue !== "") {
          const trait = {name: cleanName, value: parseInt(cleanValue, 10)};
          if (!isNaN(trait.value)) {
            newTraits.push(trait);
          }
        }
      }
    }
    await this.object.update( {"system.traits": newTraits});
  }

  async _onMuscleWeaponAttributeChange(event) {
    await this.object.update( {"system.muscleweapon": event.target.value});
  }

  async _onDamageCapacityAttributeChange(event) {
    await this.object.update( {"system.damagecap": event.target.value});
  }
  
  async _onSkillGroupChange(event) {
    const newGroups = [event.target.value.trim(), this.object.system.groups[1]]
      .filter((item) => item !== "" && typeof item !== "undefined");
    await this.object.update({"system.groups": newGroups});
  }

  async _onSkillGroup2Change(event) {
    const newGroups = [this.object.system.groups[0], event.target.value.trim()]
      .filter((item) => item !== "" && typeof item !== "undefined");
    await this.object.update({"system.groups": newGroups});
  }
  
  async _onNumberFieldChange(event) {
    const result = parseInt(event.target.value, 10);
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
