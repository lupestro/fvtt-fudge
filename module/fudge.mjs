import ActorFudge from "./documents/actor.mjs";
import ItemFudge from "./documents/item.mjs";
import ActorSheetFudgeCharacter from "./applications/character.mjs";
import ItemSheetFudge from "./applications/item.mjs";
import {registerActorDataModels} from "./data-models/actor.mjs";
import {registerItemDataModels} from "./data-models/item.mjs";
import TraitRoll from "./trait-roll.mjs";
import PyramidFudgeDie from "./pyramid-fudge-die.mjs";

CONFIG.Actor.documentClass = ActorFudge;
CONFIG.Item.documentClass = ItemFudge;
const FANTASY_FUDGE_ATTRIBUTES_FROM_COMPENDIUM = "RqHSqHtArZYVOJap";
const FANTASY_FUDGE_SKILLS_COMPENDIUM = "fudge-rpg.ff-skills";

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

const availableAttributes = () => {
  const result = {};
  game.collections.get("Item")
    .filter((item) => item.type === "attributeset")
    .forEach( (item) => { 
      result[item._id] = `${item.name} (Items)`;
    });
  game.packs.forEach((pack) => {
    if (pack.metadata.type === "Item") {
      pack.index.filter((item) => item.type === "attributeset")
      .forEach( (item) => {
        result[item._id] = `${item.name} (${pack.metadata.label})`;
      });
    }
  });
  return result;
};

const availableSkillSets = () => {
  const result = {};
  game.packs.forEach((pack) => {
    if (pack.metadata.type === "Item") {
      if (pack.index.find((item) => item.type === "skill")) {
        result[pack.metadata.id] = pack.metadata.label;
      }
    } 
  });
  return result;
};

/**
 * We have to register these at ready, because they require
 * looking at items and loaded compendia for attribute sets.
 */
const registerResourceDependentSystemSettings = function() {
  game.settings.register("fudge-rpg", "defaultattributeset", {
    name: "FUDGERPG.DefaultAttributeSet",
    hint: "FUDGERPG.DefaultAttributeSetHint",
    scope: "world",
    config: true,
    default: FANTASY_FUDGE_ATTRIBUTES_FROM_COMPENDIUM,
    type: String,
    choices: availableAttributes()
  });
  game.settings.register("fudge-rpg", "fivepointskillcompendium", {
    name: "FUDGERPG.FivePointSkillCompendium",
    hint: "FUDGERPG.FivePointSkillCompendiumHint",
    scope: "world",
    config: true,
    default: FANTASY_FUDGE_SKILLS_COMPENDIUM,
    type: String,
    choices: availableSkillSets()
  });
};

const registerTraitLevels = function() {
  game.settings.register("fudge-rpg", "traitlevels", {
    name: "FUDGERPG.TraitLevels",
    hint: "FUDGERPG.TraitLevelsHint",
    scope: "world",
    config: true,
    default: "standard",
    type: String,
    choices: {
      standard: "FUDGERPG.TraitLevelsStandard",
      expanded: "FUDGERPG.TraitLevelsExpanded",
      extended: "FUDGERPG.TraitLevelsExtended"
    }
  });
};

const registerBaseDieRoll = function() {
  game.settings.register("fudge-rpg", "baseroll", {
    name: "FUDGERPG.BaseDieRoll",
    hint: "FUDGERPG.BaseDieRollHint",
    scope: "world",
    config: true,
    default: "standard",
    type: String,
    choices: {
      standard: "FUDGERPG.BaseDieRollFudge",
      dsixes: "FUDGERPG.BaseDieRollDiffD6",
      pyramid: "FUDGERPG.BaseDieRollPyramid"
    }
  });
};

/**
 * We register everything that we can at init. This is especially
 * important for the trait levels because they are used in
 * restoring the chat history.
 */
const registerIndependentSystemSettings = function() {
  registerTraitLevels();
  game.settings.register("fudge-rpg", "initialattrlevels", {
    name: "FUDGERPG.InitialAttrLevels",
    hint: "FUDGERPG.InitialAttrLevelsHint",
    scope: "world",
    config: true,
    default: 3,
    type: Number
  });
  game.settings.register("fudge-rpg", "initialskilllevels", {
    name: "FUDGERPG.InitialSkillLevels",
    hint: "FUDGERPG.InitialSkillLevelsHint",
    scope: "world",
    config: true,
    default: 20,
    type: Number
  });
  game.settings.register("fudge-rpg", "initialgifts", {
    name: "FUDGERPG.InitialGifts",
    hint: "FUDGERPG.InitialGiftsHint",
    scope: "world",
    config: true,
    default: 2,
    type: Number
  });
  registerBaseDieRoll();
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
  registerResourceDependentSystemSettings();
});

Hooks.once("init", function() {
  const PYRAMID = "p";
  CONFIG.Dice.rolls.push(TraitRoll);
  CONFIG.Dice.types.push(PyramidFudgeDie);
  CONFIG.Dice.terms[PYRAMID] = PyramidFudgeDie;
  registerActorDataModels();
  registerItemDataModels();

  Actors.unregisterSheet("core", ActorFudge);
  Actors.registerSheet("fudge-rpg", ActorSheetFudgeCharacter, {
    types: ["character"],
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
  registerIndependentSystemSettings();
  loadPartials([]);
  //   "systems/fudge-rpg/templates/partials/traitlevel-selector.hbs"
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  dice3d.addSystem( {id: "fudge-rpg", name: "Fudge"}, "preferred");
  dice3d.addDicePreset( {
    type: "dp",
    labels: ["\u2212\u2212", "\u2212", " ", "+", "++", "\u2212\u2212", "\u2212", " ", "+", "++"],
    system: "fudge-rpg",
    values: {min: -2, max: 2}
  }, "d5");
});
