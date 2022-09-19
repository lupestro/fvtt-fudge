import ActorFudge from "./documents/actor.mjs";
import ItemFudge from "./documents/item.mjs";
import ActorSheetFudgeMajor from "./applications/major-actor.mjs";
import ItemSheetFudge from "./applications/item.mjs";

CONFIG.Actor.documentClass = ActorFudge;
CONFIG.Item.documentClass = ItemFudge;

// eslint-disable-next-line no-unused-vars
const loadPartials = function(partials) {
  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`fudge.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }

  return loadTemplates(paths);
};

const displayWithSign = function(num) {
  return num > 0 ? `+${num}` : num.toString();
};

Hooks.once("init", function() {
  Actors.unregisterSheet("core", ActorFudge);
  Actors.registerSheet("fudge", ActorSheetFudgeMajor, {
    types: ["major"],
    makeDefault: true,
    label: "FUDGE.SheetClassCharacter"
  });
  Items.unregisterSheet("core", ItemFudge);
  Items.registerSheet("fudge", ItemSheetFudge, {
    types: ["attributeset","skill","gift","fault","equipment"],
    makeDefault: true,
    label: "FUDGE.SheetClassItem"
  });
Handlebars.registerHelper({displayWithSign});
loadPartials([]);
  //   "systems/fudge/templates/partials/traitlevel-selector.hbs"
});
