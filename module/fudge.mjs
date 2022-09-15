import ActorFudge from "./documents/actor.mjs";
import ItemFudge from "./documents/item.mjs";
import ActorSheetFudgeMajor from "./applications/major-actor.mjs";

CONFIG.Actor.documentClass = ActorFudge;
CONFIG.Item.documentClass = ItemFudge;

Hooks.once("init", function() {
    Actors.unregisterSheet("core", ActorFudge);
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

