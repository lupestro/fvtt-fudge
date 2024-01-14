import TraitRoll from "../trait-roll.mjs";
import FivePointWorksheet from "./five-point.mjs";
import {tradePoints} from "../trades.mjs";

const WOUND_MODIFIER_NEARDEATH = -10;
const WOUND_MODIFIER_INCAPACITATED = -5;
const WOUND_MODIFIER_VERYHURT = -2;
const WOUND_MODIFIER_HURT = -1;
const WOUND_MODIFIER_OK = 0;
const SKILL_LEVEL_POOR = -2;

/**
 * Extend the base ActorSheet class to implement our character sheet.
 */

export default class ActorSheetFudgeMajor extends ActorSheet {

  // -------- Overrides --------

  get template() {
    return "systems/fudge-rpg/templates/major-actor.hbs";
  }

  static get defaultOptions() {
    const newOptions = super.defaultOptions;
    newOptions.dragDrop.push({dragSelector: ".occ-count", dropSelector: ".occ-count"});
    return newOptions;
  }

  /*
   * The context data provided by getData is the data made available to the template.
   * It is not available via "this", so it cannot be used in event listeners.
   */
  async getData(options) {
    const context = super.getData(options);
    const {actor} = context;

    /*
     * A constant is being used here as a temporary measure. 
     * What should happen eventually: 
     * * the actor defines the number of boxes at each level according to a game rule.
     * * this method derives the following structure from that data and the actors wounds.
     * Since we're not touching the actor yet and haven't defined a mechanism for customization
     * we'll use a default constant set here for now.
     */
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
    context.attributeset = this.object.items.find((item) => item.type === "attributeset");
    context.traitlevels = this.object.system.traitlevels;
    context.notesHTML = await TextEditor.enrichHTML(actor.system.notes, {async: true});
  
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".traitselect").change(this._onLevelChange.bind(this));
    html.find(".woundbox").change(this._onWoundsChange.bind(this));
    html.find("#charname").change(this._onCharacterNameChange.bind(this));
    html.find("#fp").change(this._onScoreChange.bind(this));
    html.find("#ep").change(this._onScoreChange.bind(this));
    html.find("#attribute-points").change(this._onAttributePointsChange.bind(this));
    html.find("#gift-points").change(this._onGiftPointsChange.bind(this));
    html.find("#skill-points").change(this._onSkillPointsChange.bind(this));
    html.find("#fault-points").change(this._onFaultPointsChange.bind(this));
    html.find(".delete-button").click(this._onDeleteClick.bind(this));
    html.find(".roll-button").click(this._onRollClick.bind(this));
    html.find(".itemname").click(this._onSelectItem.bind(this));
    html.find("#fivepoint").click(this._onFivePointFudge.bind(this));
  }

  _onDragStart(event) {
    if (event.currentTarget.classList.contains("occ-count")) {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        from: event.currentTarget.id
      }));
    } else {
      super._onDragStart(event);
    }
  }

  _onDrop(event) {
    if (event.toElement.classList.contains("occ-count")) {
      const data = TextEditor.getDragEventData(event);
      if (data.from) {
        const srcElement = this.form.querySelector(`#${data.from}`);
        try {
          this.object.update(tradePoints(srcElement, event.toElement));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.message);
        }
      }
    } else {
      super._onDrop(event);
    }
  }

  // -------- Utility methods --------

  getTraitModifier(type, id) {
    let modifier = 0;
    let traitName = "";
    if (type === "attr") {
      const attrset = this.object.items.find( (item) => item.type === "attributeset" );
      modifier = attrset.system.attributes[parseInt(id, 10)].level;
      traitName = attrset.system.attributes[parseInt(id, 10)].name;
    } else if (type === "skill") {
      const skill = this.object.items.get(id);
      modifier = skill.system.level;
      traitName = skill.name;
    }
    return {modifier, traitName};
  }

  get woundModifier () {
    if (this.object.system.wounds.neardeath > 0) {
      return WOUND_MODIFIER_NEARDEATH;
    } else if (this.object.system.wounds.incapacitated > 0) {
      return WOUND_MODIFIER_INCAPACITATED;
    } else if (this.object.system.wounds.veryhurt > 0) {
      return WOUND_MODIFIER_VERYHURT;
    } else if (this.object.system.wounds.hurt > 0) {
      return WOUND_MODIFIER_HURT;
    } 
    return WOUND_MODIFIER_OK;
  }

  // -------- Event Listeners --------

  async _onLevelChange(event) {
    const control = event.target;
    const level = parseInt(control.value, 10);
    const [prefix, id] = control.id.split("-");
    if (prefix === "attr") {
      const attrIndex = parseInt(id, 10);
      const attrset = this.object.items.find((item) => item.type === "attributeset" );
      const oldLevel = attrset.system.attributes[attrIndex].level;
      const newAttributes = foundry.utils.deepClone(attrset.system.attributes);
      newAttributes[attrIndex].level = level;
      await attrset.update({"system.attributes": newAttributes});
      await this.object.update({
        "system.unspent.attrlevels": this.object.system.unspent.attrlevels - (level - oldLevel)
      });
    } else if (prefix === "sel") {
      const skill = this.object.items.get(id);
      const oldLevel = skill.system.level;
      await skill.update({"system.level": level});
      await this.object.update({
        "system.unspent.skilllevels": this.object.system.unspent.skilllevels - (level - oldLevel)
      });
    } 
  }

  async _onWoundsChange(event) {
    const control = event.target;
    const [levelToCheck] = control.id.split("-");
    let newCount = 0;
    for (const box of this.form) {
      if (box.classList.contains("woundbox") && box.id.startsWith(levelToCheck)) {
          newCount += box.checked ? 1 : 0;
      }
    }
    const updates = {};
    updates[`system.wounds.${levelToCheck}`] = newCount;
    await this.object.update(updates);
  }
  
  async _onCharacterNameChange(event) {
    await this.object.update({name: event.target.value.trim()});
  }
  
  async _onAttributePointsChange(event) {
    const result = parseInt(event.target.value, 10);
    if (!isNaN(result)) {
      await this.object.update({"system.unspent.attrlevels": result});
    }
  }

  async _onSkillPointsChange(event) {
    const result = parseInt(event.target.value, 10);
    if (!isNaN(result)) {
      await this.object.update({"system.unspent.skilllevels": result});
    }
  }

  async _onGiftPointsChange(event) {
    const result = parseInt(event.target.value, 10);
    if (!isNaN(result)) {
      await this.object.update({"system.unspent.gifts": result});
    }
  }

  async _onFaultPointsChange(event) {
    const result = parseInt(event.target.value, 10);
    if (!isNaN(result)) {
      await this.object.update({"system.unspent.faults": result});
    }
  }

  async _onScoreChange(event) {
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

  async _onDeleteClick(event) {
    const [prefix, id] = event.target.id.split("-");
    if (prefix === "del") {
      const item = this.object.items.get(id);
      if (item.type === "skill") {
        await this.object.update({
          "system.unspent.skilllevels":
            this.object.system.unspent.skilllevels - (SKILL_LEVEL_POOR - item.system.level)
        });
      }
      if (item.type === "gift") {
        await this.object.update({"system.unspent.gifts": this.object.system.unspent.gifts + 1});
      }
      if (item.type === "fault") {
        await this.object.update({"system.unspent.faults": this.object.system.unspent.faults - 1});
      }
      await this.object.deleteEmbeddedDocuments("Item", [id]);
    }
  }

  async _onRollClick(event) {
    const [prefix, type, id] = event.target.id.split("-");
    if (prefix === "roll") {
      if (this.woundModifier === WOUND_MODIFIER_NEARDEATH) {
        await Dialog.prompt({
          title: game.i18n.localize("FUDGERPG.NoActionsTitle"),
          content: game.i18n.localize("FUDGERPG.NoActionsNearDeath"),
          label: "OK"
         });
      } else if (this.woundModifier === WOUND_MODIFIER_INCAPACITATED) {
        await Dialog.prompt({
          title: game.i18n.localize("FUDGERPG.NoActionsTitle"),
          content: game.i18n.localize("FUDGERPG.NoActionsIncapacitated"),
          label: "OK"
         });
      } else {
        const traitModifier = this.getTraitModifier(type, id);
        let rolldice = "4dF";
        switch (game.settings.get("fudge-rpg", "baseroll")) {
          case "pyramid": 
            rolldice = "2dP"; 
            break;
          case "dsixes":
            rolldice = "(d6-d6)";
            break;
          case "standard":
          default:
            rolldice = "4dF";
        }

        const roll = new TraitRoll(`${rolldice} + (@levelmod) + (@woundmod)`, {
          levelmod: traitModifier.modifier, 
          woundmod: this.woundModifier
        });
        await roll.evaluate({async: true});
        await roll.toMessage({
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          flavor: game.i18n.localize("FUDGERPG.Rolling").replace("{traitname}", traitModifier.traitName)
        });
      }
    }
  }

  _onSelectItem(event) {
    const itemId = event.target.getAttribute("data-id");
    const item = this.object.items.get(itemId);
    item.sheet.render(true);
  }

  _onFivePointFudge() {
    new FivePointWorksheet(
      this.actor, 
      {popOut: true, resizable: true, width: 500}
    ).render(true);
  }
}
