export default class TraitRoll extends Roll {
  levelset = [
    {name: game.i18n.localize("FUDGE.TraitLevel.Superb"), value: +3 },
    {name: game.i18n.localize("FUDGE.TraitLevel.VeryGood"), value: +2 },
    {name: game.i18n.localize("FUDGE.TraitLevel.Good"), value: +1 },
    {name: game.i18n.localize("FUDGE.TraitLevel.Fair"), value: 0 },
    {name: game.i18n.localize("FUDGE.TraitLevel.Mediocre"), value: -1 },
    {name: game.i18n.localize("FUDGE.TraitLevel.Poor"), value: -2 },
    {name: game.i18n.localize("FUDGE.TraitLevel.Terrible"), value: -3 }
  ];
  levelname(levelset) {
    let levelsetitem = levelset.find((levelInSet) => this.total === levelInSet.value);
    if (levelsetitem) {
      return levelsetitem.name;
    } else {
      if (this.total > 0) {
        let levelsetmax = levelset.reduce((prevItem, currItem) => {
          if (!prevItem) {
            return currItem;
          } else {
            return (currItem.value > prevItem.value) ? currItem : prevItem;
          }
        }, null);
        if (this.total > levelsetmax.value) {
          return `${levelsetmax.name} + ${this.total - levelsetmax.value}`;
        }
      } else {
        let levelsetmin = levelset.reduce((prevItem, currItem) => {
          if (!prevItem) {
            return currItem;
          } else {
            return (currItem.value < prevItem.value) ? currItem : prevItem;
          }
        }, null);  
        if (this.total < levelsetmin.value) {
          return `${levelsetmin.name} - ${levelsetmin.value - this.total}`;
        }
      }
    }
  }

  async render(options) {
    console.log("Options: ", options)
    let isPrivate = options.isPrivate ?? false;
    let template = options.template ?? this.constructor.CHAT_TEMPLATE;
    let flavor = options.flavor;
    if ( !this._evaluated ) await this.evaluate({async: true});
    const chatData = {
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : flavor,
      user: game.user.id,
      tooltip: isPrivate ? "" : await super.getTooltip(),
      total: `${this.levelname(this.levelset)} (${this.total})`
    };
    return renderTemplate(template, chatData);
  }
}
  