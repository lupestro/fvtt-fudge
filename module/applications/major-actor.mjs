/**
 * Extend the base ActorSheet class to implement our character sheet.
 */
 export default class ActorSheetFudgeMajor extends ActorSheet {

  // -------- Overrides --------

  get template() {
    return "systems/fudge/templates/major-actor.hbs";
  }
  
  // The context data provided by getData is the data made available to the template.
  // It is not available via "this", so it cannot be used in event listeners.
  async getData(options) {
    const context = super.getData(options);
    const actor = context.actor;

    // A constant is being used here as a temporary measure. 
    // What should happen eventually: 
    // * the actor defines the number of boxes at each level according to a game rule.
    // * this method derives the following structure from that data and the actors wounds.
    // Since we're not touching the actor yet and haven't defined a mechanism for customization
    // we'll use a default constant set here for now.
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

    let traitlevelset = this.object.items.find ((item) => 
      item.type === "traitlevelset");
    context.traitlevels = traitlevelset?.system.levels;
    context.attributeset = this.object.items.find((item) =>
      item.type === "attributeset");

    foundry.utils.mergeObject(context, {
      descriptionHTML: await TextEditor.enrichHTML(actor.system.notes, {
        secrets: actor.isOwner,
        async: true,
        relativeTo: this.actor
      }),
    });
  
    return context;
  }

  activateListeners(html) {
    html.find(".traitselect").change(this._onLevelChange.bind(this));
    html.find(".woundbox").change(this._onWoundsChange.bind(this));
    html.find("#charname").change(this._onCharacterNameChange.bind(this));
    html.find("#fp").change(this._onScoreChange.bind(this));
    html.find("#ep").change(this._onScoreChange.bind(this));
    html.find(".delete-button").click(this._onDeleteClick.bind(this));
    html.find(".roll-button").click(this._onRollClick.bind(this));
  }

  // -------- Event Listeners --------

  async _onLevelChange(event) {
    let control = event.target;
    let level = parseInt(control.value);
    const [prefix, id] = control.id.split('-');
    if (prefix === "attr") {
      let attrset = this.object.items.find ( 
        (item) => item.type === "attributeset" );
      let newAttributes = foundry.utils.deepClone(attrset.system.attributes);
      newAttributes[parseInt(id)].level = level;
      await attrset.update({"system.attributes": newAttributes});  
    } else if (prefix === "sel") {
      let skill = this.object.items.get(id);
      await skill.update({"system.level": level});
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

  async _onRollClick(event) {
    const [prefix, type, id] = event.target.id.split("-");
    if (prefix === "roll") {
      let modifier = 0;
      let name = "";
      if (type === "attr") {
        let attrset = this.object.items.find ( 
          (item) => item.type === "attributeset" );
        modifier = attrset.system.attributes[parseInt(id)].level;
        name = attrset.system.attributes[parseInt(id)].name;
      } else if (type === "skill") {
        let skill = this.object.items.get(id);
        modifier = skill.system.level;
        name = skill.name;
      }
      console.log(name, modifier);
      let r = new Roll("4df + (@mod)", {mod: modifier});
      await r.evaluate({async: true});
      let chatMessage = await r.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Rolling ${name}...`
      });
    }
  }
}
