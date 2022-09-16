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
 }
