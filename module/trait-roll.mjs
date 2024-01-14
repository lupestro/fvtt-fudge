export default class TraitRoll extends Roll {
  levelname(levelset) {
    const levelsetitem = levelset.find((levelInSet) => this.total === levelInSet.value);
    if (levelsetitem) {
      return levelsetitem.name;
    }
    if (this.total > 0) {
      const levelsetmax = levelset.reduce((prevItem, currItem) => {
        if (prevItem) {
          return currItem.value > prevItem.value ? currItem : prevItem;
        }
        return currItem;
      }, null);
      return `${levelsetmax.name} + ${this.total - levelsetmax.value}`;
    }
    const levelsetmin = levelset.reduce((prevItem, currItem) => {
      if (prevItem) {
        return currItem.value < prevItem.value ? currItem : prevItem;
      }
      return currItem;
    }, null);
    return `${levelsetmin.name} - ${levelsetmin.value - this.total}`;
  }

  async render(options) {
    const LEVELSET = [
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Superb"), value: +3}, // eslint-disable-line no-magic-numbers
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Great"), value: +2}, // eslint-disable-line no-magic-numbers
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Good"), value: +1},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Fair"), value: 0},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Mediocre"), value: -1},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Poor"), value: -2},
      {name: game.i18n.localize("FUDGERPG.TraitLevel.Terrible"), value: -3}
    ];
    if (game.settings.get("fudge-rpg", "traitlevels") === "extended") {
      LEVELSET.unshift(
        {name: game.i18n.localize("FUDGERPG.TraitLevel.Legendary"), value: +5}, // eslint-disable-line no-magic-numbers
        {name: game.i18n.localize("FUDGERPG.TraitLevel.Heroic"), value: +4} // eslint-disable-line no-magic-numbers
      );
      LEVELSET.push({
        name: game.i18n.localize("FUDGERPG.TraitLevel.Abysmal"), value: -4 // eslint-disable-line no-magic-numbers
      }); 
    }
    if (game.settings.get("fudge-rpg", "traitlevels") === "expanded") {
      LEVELSET.unshift({
        name: game.i18n.localize("FUDGERPG.TraitLevel.Legendary"), value: +4 // eslint-disable-line no-magic-numbers
      });
      LEVELSET.push({
        name: game.i18n.localize("FUDGERPG.TraitLevel.Abysmal"), value: -4 // eslint-disable-line no-magic-numbers
      });
    }
    const isPrivate = options.isPrivate ?? false;
    const template = options.template ?? this.constructor.CHAT_TEMPLATE;
    const {flavor} = options;
    if ( !this._evaluated ) {
      await this.evaluate({async: true});
    }
    const chatData = {
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : flavor,
      user: game.user.id,
      tooltip: isPrivate ? "" : await super.getTooltip(),
      total: `${this.levelname(LEVELSET)} (${this.total})`
    };
    return renderTemplate(template, chatData);
  }
}
