import ActorFudge from "./documents/actor.mjs";
import ItemFudge from "./documents/item.mjs";
import ActorSheetFudgeCharacter from "./applications/character.mjs";
import ItemSheetFudge from "./applications/item.mjs";
import {registerActorDataModels} from "./data-models/actor.mjs";
import {registerItemDataModels} from "./data-models/item.mjs";
import TraitRoll from "./trait-roll.mjs";
import PyramidFudgeDie from "./pyramid-fudge-die.mjs";
import {VNActors, VNItems, vnLoadTemplates} from "./ver-neutral.mjs";
import {registerSettings, migrateSettings, controlSettingsRendering} from "./settings.mjs";

CONFIG.Actor.documentClass = ActorFudge;
CONFIG.Item.documentClass = ItemFudge;

// Version-neutral (V13 vs. V12) references to key data structures

const loadPartials = function(partials) {
  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`fudge.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }
  return vnLoadTemplates(paths);
};

// Primary hooks for initialization
Hooks.once("init", function() {
  const PYRAMID = "p";
  CONFIG.Dice.rolls.push(TraitRoll);
  CONFIG.Dice.types.push(PyramidFudgeDie);
  CONFIG.Dice.terms[PYRAMID] = PyramidFudgeDie;
  registerActorDataModels();
  registerItemDataModels();

  VNActors.unregisterSheet("core", ActorFudge);
  VNActors.registerSheet("fudge-rpg", ActorSheetFudgeCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "FUDGERPG.SheetClassCharacter"
  });
  
  VNItems.unregisterSheet("core", ItemFudge);
  VNItems.registerSheet("fudge-rpg", ItemSheetFudge, {
    types: ["traitladder", "attributeset", "skill", "gift", "fault", "equipment"],
    makeDefault: true,
    label: "FUDGERPG.SheetClassItem"
  });

  Handlebars.registerHelper({
    displayWithSign(num) {
      return num > 0 ? `+${num}` : `${num}`;
    }
  });
  loadPartials([]);
});

Hooks.once("setup", function() {
  registerSettings();
});

Hooks.once("ready", function() {
  migrateSettings();
  if (!game.user.getFlag("fudge-rpg", "visited")) {
    Dialog.prompt({
      title: game.i18n.localize("FUDGERPG.AboutFudge.Title"),
      content: game.i18n.localize("FUDGERPG.AboutFudge.LegalNotice"),
      label: "OK"
    }).then( () => {
      game.user.setFlag("fudge-rpg", "visited", true);
    });
  }
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  dice3d.addSystem( {id: "fudge-rpg", name: "Fudge"}, "preferred");
  // "dp" die has ten sides with two sets of --, -, blank, +, ++.
  dice3d.addDicePreset( {
    type: "dp",
    labels: [
      "\u2212\u2212", "\u2212", " ", "+", "++", 
      "\u2212\u2212", "\u2212", " ", "+", "++"
    ],
    system: "fudge-rpg",
    values: {min: -2, max: 2}
  }, "d5");
});

Hooks.on("renderSettingsConfig", (app, arg) => {
  controlSettingsRendering(app, arg);  
});
