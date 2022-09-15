/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
 class ActorFudge extends Actor {
    // except we don't have any additional document-level logic yet ... but perhaps we will ...
}

/**
 * Extend the base Item class to implement additional system-specific logic.
 */
 class ItemFudge extends Item {
    // except we don't have any additional document-level logic yet ... but perhaps we will ...
 }

/**
 * Extend the base ActorSheet class to implement our character sheet.
 */
 class ActorSheetFudgeMajor extends ActorSheet {
    get template() {
        return `systems/fudge/templates/major-actor.hbs`;
    }
}

CONFIG.Actor.documentClass = ActorFudge;
CONFIG.Item.documentClass = ItemFudge;

Hooks.once("init", function() {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fudge", ActorSheetFudgeMajor, {
      types: ["major"],
      makeDefault: true,
      label: "FUDGE.SheetClassCharacter"
    });
    const partials = [
        // Actor Sheet Partials
      ];
    
      const paths = {};
      for ( const path of partials ) {
        paths[path.replace(".hbs", ".html")] = path;
        paths[`dnd5e.${path.split("/").pop().replace(".hbs", "")}`] = path;
      }
    
      return loadTemplates(paths);
    
});
//# sourceMappingURL=fudge.mjs.map
