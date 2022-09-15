/**
 * Extend the base ActorSheet class to implement our character sheet.
 */
 export default class ActorSheetFudgeMajor extends ActorSheet {
    get template() {
        return `systems/fudge/templates/major-actor.hbs`;
    }
};
