import ActorFudge from "./documents/actor.mjs";
import ItemFudge from "./documents/item.mjs";
import ActorSheetFudgeMajor from "./applications/major-actor.mjs";
import ItemSheetFudge from "./applications/item.mjs";
import TraitRoll from "./trait-roll.mjs";

CONFIG.Actor.documentClass = ActorFudge;
CONFIG.Item.documentClass = ItemFudge;
const FANTASY_FUDGE_ATTRIBUTES_FROM_COMPENDIUM = "RqHSqHtArZYVOJap";

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

const registerSystemSettings = function() {
  game.settings.register("fudge-rpg", "traitlevels", {
    name: "FUDGERPG.TraitLevels",
    hint: "FUDGERPG.TraitLevelsHint",
    scope: "world",
    config: true,
    default: "standard",
    type: String,
    choices: {
      standard: "FUDGERPG.TraitLevelsStandard",
      extended: "FUDGERPG.TraitLevelsExtended"
    }
  });
  
  game.settings.register("fudge-rpg", "defaultattributeset", {
    name: "FUDGERPG.DefaultAttributeSet",
    hint: "FUDGERPG.DefaultAttributeSetHint",
    scope: "world",
    config: true,
    default: FANTASY_FUDGE_ATTRIBUTES_FROM_COMPENDIUM,
    type: String,
    choices: availableAttributes()
  });
  
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
  registerSystemSettings();
});

Hooks.once("init", function() {
  CONFIG.Dice.rolls.push(TraitRoll);
 
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
