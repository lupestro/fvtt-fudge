import ActorFudge from "./documents/actor.mjs";
import ItemFudge from "./documents/item.mjs";
import ActorSheetFudgeMajor from "./applications/major-actor.mjs";
import ItemSheetFudge from "./applications/item.mjs";
import TraitRoll from "./trait-roll.mjs";

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

const registerSystemSettings = function() {
  game.settings.register("fudge-rpg", "traitlevels", {
    name: "FUDGERPG.TraitLevels",
    hint: "FUDGERPG.TraitLevelsHint",
    scope: "world",
    config: true,
    default: "normal",
    type: String,
    choices: {
      standard: "FUDGERPG.TraitLevelsStandard",
      extended: "FUDGERPG.TraitLevelsExtended"
    }
  });
};

Hooks.once("ready", async function() {
  if (!game.user.getFlag("fudge-rpg", "visited")) {
    await Dialog.prompt({
      title: game.i18n.localize("FUDGERPG.AboutFudge.Title"),
      content: game.i18n.localize("FUDGERPG.AboutFudge.LegalNotice"),
      label: "OK"
    });
    game.user.setFlag("fudge-rpg", "visited", true);
  }
});

Hooks.once("init", function() {
  CONFIG.Dice.rolls.push(TraitRoll);
 
  registerSystemSettings();
  Actors.unregisterSheet("core", ActorFudge);
  Actors.registerSheet("fudge-rpg", ActorSheetFudgeMajor, {
    types: ["major"],
    makeDefault: true,
    label: "FUDGERPG.SheetClassCharacter"
  });
  Items.unregisterSheet("core", ItemFudge);
  Items.registerSheet("fudge-rpg", ItemSheetFudge, {
    types: ["attributeset", "skill", "gift", "fault", "equipment"],
    makeDefault: true,
    label: "FUDGERPG.SheetClassItem"
  });
Handlebars.registerHelper({displayWithSign});
loadPartials([]);
  //   "systems/fudge-rpg/templates/partials/traitlevel-selector.hbs"
});
