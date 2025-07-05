import {vnRenderTemplate, vnFromUuid} from "./ver-neutral.mjs";

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
    const traitladder = await vnFromUuid(game.settings.get("fudge-rpg", "traitladder"));
    const LEVELSET = traitladder.system.traits;
    const isPrivate = options.isPrivate ?? false;
    const template = options.template ?? this.constructor.CHAT_TEMPLATE;
    const {flavor} = options;
    if ( !this._evaluated ) {
      await this.evaluate();
    }
    const chatData = {
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : flavor,
      user: game.user.id,
      tooltip: isPrivate ? "" : await super.getTooltip(),
      total: `${this.levelname(LEVELSET)} (${this.total})`
    };
    return vnRenderTemplate(template, chatData);
  }
}
