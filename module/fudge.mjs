import Actor5e from "./documents/actor.mjs";
import Item5e from "./documents/item.mjs";
import ActorSheetFudgeMajor from "./applications/major-actor.mjs";

CONFIG.Actor.documentClass = Actor5e;
CONFIG.Item.documentClass = Item5e;

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

