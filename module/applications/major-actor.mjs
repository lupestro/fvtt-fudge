/**
 * Extend the base ActorSheet class to implement our character sheet.
 */
 export default class ActorSheetFudgeMajor extends ActorSheet {
  get template() {
    return "systems/fudge/templates/major-actor.hbs";
  }
  
  getData(options) {
    const context = super.getData(options);
    context.woundlevels = {
      scratch: [false, false, false],
      hurt: [false],
      veryhurt: [false],
      incapacitated: [false],
      neardeath: [false]
    };
    for (const level in context.actor.system.wounds) {
      if ({}.hasOwnProperty.call(context.actor.system.wounds, level)) {
        for (let box = 0; box < context.woundlevels[level].length; box += 1) {
          context.woundlevels[level][box] = box < context.actor.system.wounds[level];
        }
      }
    }
    context.traitlevels = [];
    for (const item of context.actor.items) {
      if (item.type === "traitlevelset") {
        context.traitlevels = item.system.levels;
        break;
      }
    }
    return context;
  }

  activateListeners(html) {
    html.find(".traitselect").change(this._onLevelChange.bind(this));
    html.find(".woundbox").change(this._onWoundsChange.bind(this));
    html.find("#charname").change(this._onCharacterNameChange.bind(this));
    html.find("#fp").change(this._onScoreChange.bind(this));
    html.find("#ep").change(this._onScoreChange.bind(this));
    html.find(".delete-button").click(this._onDeleteClick.bind(this));
  }

  async _onLevelChange(event) {
    let control = event.target;
    if (control.id.startsWith("attr-")) {
      let index = control.id.substring(5);
      //console.log("Attribute: ", index, control.value);
      let attributeset = undefined;
      for (const item of this.object.items) {
        if (item.type === "attributeset") {
          attributeset = item;
          break;
        }
      }
      let newAttributes = JSON.parse(JSON.stringify(attributeset.system.attributes));
      newAttributes[index].level = parseInt(control.value);
      await attributeset.update({"system.attributes": newAttributes});
   } else if (control.id.startsWith("sel-")) {
      let id = control.id.substring(4);
      console.log("Skill: ", id, control.value);
      let skill = undefined;
      for (const item of this.object.items) {
        if (item.id === id) {
          skill = item;
          break;
        }
      }
      await skill.update({"system.level": parseInt(control.value)});
    }
  }

  async _onWoundsChange(event) {
    const control = event.target;
    let [levelToCheck] = control.id.split("-");
    let newCount = 0;
    for (const box of this.form) {
      if (box.classList.contains('woundbox') && box.id.startsWith(levelToCheck)) {
          newCount += box.checked ? 1 : 0;
      }
    }
    const updates = {};
    updates[`system.wounds.${levelToCheck}`] = newCount;
    await this.object.update(updates)
  }
  
  async _onCharacterNameChange(event) {
    await this.object.update({name: event.target.value.trim()});
  }

  async _onScoreChange(event) {
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

  async _onDeleteClick(event) {
    const [prefix, id] = event.target.id.split("-");
    if (prefix === "del") {
      await this.object.deleteEmbeddedDocuments('Item', [id]);
    }
  }
}
