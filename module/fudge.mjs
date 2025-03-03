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
const SETTING_SHOWS_FOR_CREATION_STYLE = {
  "fivepointskillcompendium": ["fivepoint"],
  "initialskilllevels": ["objective"], 
  "initialattrlevels": ["objective", "fivepoint"], 
  "initialgifts": ["objective", "fivepoint"]
};

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
 * The "traitlevels" setting must be registered at "init" because it is used to render
 * existing chat messages properly.
 */
const registerTraitLevels = function() {
  game.settings.register("fudge-rpg", "traitlevels", {
    name: "FUDGERPG.Settings.FIELDS.traitlevels.label",
    hint: "FUDGERPG.Settings.FIELDS.traitlevels.hint",
    scope: "world",
    config: true,
    default: "standard",
    requiresReload: true, 
    // Or should we register an invasive onChange?
    type: String,
    choices: {
      standard: "FUDGERPG.Settings.FIELDS.traitlevels.choices.standard",
      expanded: "FUDGERPG.Settings.FIELDS.traitlevels.choices.extended",
      extended: "FUDGERPG.Settings.FIELDS.traitlevels.choices.extended"
    }
  });
};

/**
 * We have to register these at "ready", because they require
 * looking at items and loaded compendia for attribute sets.
 */
const registerDefaultAttributeSet = function() {
  game.settings.register("fudge-rpg", "defaultattributeset", {
    name: "FUDGERPG.Settings.FIELDS.defaultattributeset.label",
    hint: "FUDGERPG.Settings.FIELDS.defaultattributeset.hint",
    scope: "world",
    config: true,
    default: FANTASY_FUDGE_ATTRIBUTES_FROM_COMPENDIUM,
    type: String,
    choices: availableAttributes()
  });
};

const registerFivePointSkillCompendium = function (characterCreationStyle) {
  game.settings.register("fudge-rpg", "fivepointskillcompendium", {
    name: "FUDGERPG.Settings.FIELDS.fivepointskillcompendium.label",
    hint: "FUDGERPG.Settings.FIELDS.fivepointskillcompendium.hint",
    scope: "world",
    config: true,
    default: FANTASY_FUDGE_SKILLS_COMPENDIUM,
    type: String,
    choices: availableSkillSets()
  });
};

/**
 * These can be registered as earlier as "init" but may need to be
 * deferred until "ready" for the settings to appear in the right order.
 */
const registerBaseDieRoll = function() {
  game.settings.register("fudge-rpg", "baseroll", {
    name: "FUDGERPG.Settings.FIELDS.baseroll.label",
    hint: "FUDGERPG.Settings.FIELDS.baseroll.hint",
    scope: "world",
    config: true,
    default: "standard",
    type: String,
    choices: {
      standard: "FUDGERPG.Settings.FIELDS.baseroll.choices.standard",
      dsixes: "FUDGERPG.Settings.FIELDS.baseroll.choices.dsixes",
      pyramid: "FUDGERPG.Settings.FIELDS.baseroll.choices.pyramid"
    }
  });
};

const registerCharacterCreationStyle = function() {
  game.settings.register("fudge-rpg", "creationstyle", {
    name: "FUDGERPG.Settings.FIELDS.creationstyle.label",
    hint: "FUDGERPG.Settings.FIELDS.creationstyle.hint",
    scope: "world",
    config: true,
    default: "fivepoint",
    type: String,
    choices: {
      subjective: "FUDGERPG.Settings.FIELDS.creationstyle.choices.subjective",
      objective: "FUDGERPG.Settings.FIELDS.creationstyle.choices.objective",
      fivepoint: "FUDGERPG.Settings.FIELDS.creationstyle.choices.fivepoint"
    }
  });
};

// eslint-disable-next-line no-unused-vars
const registerCombatStyle = function() {
  game.settings.register("fudge-rpg", "combatstyle", {
    name: "FUDGERPG.Settings.FIELDS.combatstyle.label",
    hint: "FUDGERPG.Settings.FIELDS.combatstyle.hint",
    scope: "world",
    config: true,
    default: "simultaneous",
    type: String,
    choices: {
      storyelement: "FUDGERPG.Settings.FIELDS.combatstyle.choices.storyelement",
      simultaneous: "FUDGERPG.Settings.FIELDS.combatstyle.choices.simultaneous",
      altbyteam: "FUDGERPG.Settings.FIELDS.combatstyle.choices.altbyteam",
      altbycharacter: "FUDGERPG.Settings.FIELDS.combatstyle.choices.altbycharacter"
    }
  });
};

const registerInitialSkillLevels = function(characterCreationStyle) {
  game.settings.register("fudge-rpg", "initialskilllevels", {
    name: "FUDGERPG.Settings.FIELDS.initialskilllevels.label",
    hint: "FUDGERPG.Settings.FIELDS.initialskilllevels.hint",
    scope: "world",
    config: true,
    default: 20,
    type: Number
  });
};

const registerInitialAttributeLevels = function(characterCreationStyle) {
  game.settings.register("fudge-rpg", "initialattrlevels", {
    name: "FUDGERPG.Settings.FIELDS.initialattrlevels.label",
    hint: "FUDGERPG.Settings.FIELDS.initialattrlevels.hint",
    scope: "world",
    config: true,
    // eslint-disable-next-line no-magic-numbers
    default: characterCreationStyle === "objective" ? 3 : 2,
    type: Number
  });
};

const registerInitialGifts = function(characterCreationStyle) {
  game.settings.register("fudge-rpg", "initialgifts", {
    name: "FUDGERPG.Settings.FIELDS.initialgifts.label",
    hint: "FUDGERPG.Settings.FIELDS.initialgifts.hint",
    scope: "world",
    config: true,
    default: 2,
    type: Number
  });
};

const showHideCharacterCreationSettings = function(html, value) {
  for (const setting of ["fivepointskillcompendium", "initialskilllevels", "initialattrlevels", "initialgifts"]) {
    const control = html.querySelector(`[id="settings-config-fudge-rpg.${setting}"]`);
    const div = control 
      ? control.parentElement.parentElement 
      : html.querySelector(`div[data-setting-id="fudge-rpg.${setting}"`);
    const hide = !(SETTING_SHOWS_FOR_CREATION_STYLE[setting].includes(value));
    div.classList.toggle("setting-hidden", hide);
  }
};

/**
 * Among the other things, trait levels must be registered
 * very early because they are used to restore the chat history.
 */
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

  registerTraitLevels();
  registerBaseDieRoll();

  loadPartials([]);
  //   "systems/fudge-rpg/templates/partials/traitlevel-selector.hbs"
});

Hooks.once("ready", async function() {
  if (!game.user.getFlag("fudge-rpg", "visited")) {
    await Dialog.prompt({
      title: game.i18n.localize("FUDGERPG.AboutFudge.Title"),
      content: game.i18n.localize("FUDGERPG.AboutFudge.LegalNotice"),
      label: "OK"
    });
    game.user.setFlag("fudge-rpg", "visited", true);
  }
  registerDefaultAttributeSet();
  // eslint-disable-next-line capitalized-comments
  // registerCombatStyle();
  registerCharacterCreationStyle();
  const style = game.settings.get("fudge-rpg", "creationstyle");
  registerFivePointSkillCompendium(style);
  registerInitialSkillLevels(style);
  registerInitialAttributeLevels(style);
  registerInitialGifts(style);
});

Hooks.on("renderSettingsConfig", (app, arg) => {
  const html = arg instanceof HTMLFormElement ? arg : arg[0];
  // Set up grayed settings based on ignoreEquipment at time of render
  // eslint-disable-next-line quotes
  let elem = html.querySelector('select[id="settings-config-fudge-rpg.creationstyle"]');
  if (!elem) {
    // eslint-disable-next-line quotes
    elem = html.querySelector('[data-setting-id="fudge-rpg.creationstyle"] select')
  }
  showHideCharacterCreationSettings(html, elem.value);
  // Change what is grayed as the user changes settings
  const adjustCharacterCreationListener = (event) => {
    showHideCharacterCreationSettings(html, event.target.value);
  };
  elem.addEventListener("change", adjustCharacterCreationListener);
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
