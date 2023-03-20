export default class FivePointWorksheet extends DocumentSheet { // subsidiary doc-sheet for actor

  selectedGroup;

  // -------- Overrides --------

    /** @inheritDoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "five-point-worksheet",
        classes: ["fudge-rpg","five-point-sheet"],
        template: "systems/fudge-rpg/templates/five-point.hbs",
        width: 500,
        closeOnSubmit: true,
        sheetConfig: false,
        title: "Five-Point Fudge Worksheet"
      });
    }
  
    /** @inheritDoc */
    get template() {
    return "systems/fudge-rpg/templates/five-point.hbs";
  }

    /** @inheritDoc */
    async getData(options) {
    const context = super.getData(options);
    //context.options.title = context.title = `Five-Point Fudge Worksheet: ${context.data.name}`;

    this.selectedGroup = "Athletic"; // Our only pure display state

    context.selectedGroupLevels = this.selectedGroup ? context.data.system.fivePoint.groups.find(group => group.name === this.selectedGroup).levels: [];
    context.selectedGroupSkills = this.selectedGroup ? context.data.system.groupSkills[this.selectedGroup] : [];

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  _onDragStart(event) {
    super._onDragStart(event);
  }

  _onDrop(event) {
    super._onDrop(event);
  }

  // -------- Methods --------

  // -------- Event Listeners --------

}