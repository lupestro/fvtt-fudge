import {getAttributeSets, getTraitLadders, getSkillCompendia} from "./compendia.mjs";

const FANTASY_FUDGE_ATTRIBUTES = "Compendium.fudge-rpg.attributes.Item.RqHSqHtArZYVOJap";
const FANTASY_FUDGE_SKILLSET = "fudge-rpg.ff-skills";
const STANDARD_TRAIT_LADDER = "Compendium.fudge-rpg.ladders.Item.HryXESS6BYB0ymZ3";
const SKILL_LEVELS = 20;
const GIFTS = 2;
const OBJECTIVE_ATTRIBUTE_LEVELS = 3;
const ATTRIBUTE_LEVELS = 2;

// -------- Settings Registration Templates --------

// eslint-disable-next-line max-params
const registerSelection = function(name, defaultValue, choices, reload = false) {
  game.settings.register("fudge-rpg", name, {
    name: `FUDGERPG.Settings.FIELDS.${name}.label`,
    hint: `FUDGERPG.Settings.FIELDS.${name}.hint`,
    scope: "world",
    config: true,
    default: defaultValue,
    requiresReload: reload, 
    type: String,
    choices
  });
};

const registerNumeric = function(name, defaultValue) {
  game.settings.register("fudge-rpg", name, {
    name: `FUDGERPG.Settings.FIELDS.${name}.label`,
    hint: `FUDGERPG.Settings.FIELDS.${name}.hint`,
    scope: "world",
    config: true,
    default: defaultValue,
    type: Number
  });
};

// eslint-disable-next-line max-params
const registerChoices = function (name, defaultValue, choices, reload = false) {
  const choiceHash = {};
  choices.forEach((item) => {
    choiceHash[item] = `FUDGERPG.Settings.FIELDS.${name}.choices.${item}`;
  });
  registerSelection(name, defaultValue, choiceHash, reload);
};

const collectAttributes = function() {
  const choiceHash = {};
  for (const [key, value] of Object.entries(getAttributeSets())) {
    choiceHash[key] = `${value.name} (${value.source})`;
  }
  return choiceHash;
};

const collectTraitLadders = function() {
  const choiceHash = {};
  for (const [key, value] of Object.entries(getTraitLadders())) {
    choiceHash[key] = `${value.name} (${value.source})`;
  }
  return choiceHash;
};

const showHideCharacterCreationSettings = function(html, value) {
  // Only render the settings appropriate for the selected creation style
  const SETTING_SHOWS_FOR_CREATION_STYLE = {
    "fivepointskillcompendium": ["fivepoint"],
    "initialskilllevels": ["objective"], 
    "initialattrlevels": ["objective", "fivepoint"], 
    "initialgifts": ["objective", "fivepoint"]
  };
  for (const setting of [
    "fivepointskillcompendium", 
    "initialskilllevels", 
    "initialattrlevels", 
    "initialgifts"
  ]) {
    const control = 
      html.querySelector(`[id="settings-config-fudge-rpg.${setting}"]`);
    const div = control 
      ? control.parentElement.parentElement 
      : html.querySelector(`div[data-setting-id="fudge-rpg.${setting}"`);
    const show = SETTING_SHOWS_FOR_CREATION_STYLE[setting].includes(value);
    div.classList.toggle("setting-hidden", !show);
  }
};

// -------- Public functions --------

export const registerSettings = function() {
  registerChoices("baseroll", "standard", ["standard", "dsixes", "pyramid"]);
  registerSelection("traitladder", STANDARD_TRAIT_LADDER, collectTraitLadders, true);
  registerSelection("defaultattributeset", FANTASY_FUDGE_ATTRIBUTES, collectAttributes);
  registerChoices("creationstyle", "fivepoint", ["subjective", "objective", "fivepoint"]);
  registerSelection("fivepointskillcompendium", FANTASY_FUDGE_SKILLSET, getSkillCompendia);
  registerNumeric("initialskilllevels", SKILL_LEVELS);
  registerNumeric("initialgifts", GIFTS);
  const style = game.settings.get("fudge-rpg", "creationstyle");
  if (style === "objective") {
    registerNumeric("initialattrlevels", OBJECTIVE_ATTRIBUTE_LEVELS);
  } else {
    registerNumeric("initialattrlevels", ATTRIBUTE_LEVELS);
  }
};

export const controlSettingsRendering = function (app, arg) {

  const html = arg instanceof HTMLFormElement ? arg : arg[0];
  // Set up grayed settings based on ignoreEquipment at time of render
  let elem = 
    // eslint-disable-next-line quotes
    html.querySelector('select[id="settings-config-fudge-rpg.creationstyle"]');
  if (!elem) {
    elem = 
      // eslint-disable-next-line quotes
      html.querySelector('[data-setting-id="fudge-rpg.creationstyle"] select');
  }
  showHideCharacterCreationSettings(html, elem.value);
  // Change what is grayed as the user changes settings
  const adjustCharacterCreationListener = (event) => {
    showHideCharacterCreationSettings(html, event.target.value);
  };
  elem.addEventListener("change", adjustCharacterCreationListener);
};
