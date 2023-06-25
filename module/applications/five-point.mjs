const GENERAL_GROUP_LEVEL_CAP = 1;
const OTHER_GROUP_LEVEL_CAP = 4;

const sortByName = function (first, second) {
  if (first.name < second.name) {
    return -1;
  } else if (first.name > second.name) {
    return 1;
  } 
  return 0;
};

// Subsidiary doc-sheet for actor
export default class FivePointWorksheet extends DocumentSheet { 

  // -------- Overrides --------

  constructor(...args) {
    super(...args);
    this.selectedGroup = null;
  }

  /** @inheritDoc */
  static get defaultOptions() {
    const newOptions = super.defaultOptions;
    newOptions.dragDrop.push({dragSelector: ".fp-skill", dropSelector: ".skill-name"});
    newOptions.dragDrop.push({dragSelector: ".fp-skill-group", dropSelector: ".fp-general-group"});
    return foundry.utils.mergeObject(newOptions, {
      id: "five-point-worksheet",
      classes: ["fudge-rpg", "five-point-sheet"],
      template: "systems/fudge-rpg/templates/five-point.hbs",
      width: 500,
      closeOnSubmit: true,
      sheetConfig: false,
      title: game.i18n.localize("FUDGERPG.FivePoint.Title")
    });
  }
  
  /** @inheritDoc */
  get template() {
    return "systems/fudge-rpg/templates/five-point.hbs";
  }

  /** @inheritDoc */
  async getData(options) {
    const context = super.getData(options);
    this.groups ??= await this.object.system.fivePoint.collectGroupSkills(this.object);

    context.selectedGroup = this.selectedGroup;
    context.groupData = this.groupData;
    context.selectedGroupLevels = this._formatLevelsForScreen(this._getDataForGroup(this.selectedGroup)?.levels ?? []);
    // Get the skill list
    if (this.selectedGroup === "") {
      context.groupSkills = [];
      for ( const group of this.object.system.fivePoint.generalGroups) {
        context.groupSkills = context.groupSkills.concat(this.groups[group]);
      }
    } else {
      context.groupSkills = [].concat(this.groups[this.selectedGroup]);
    }
    context.groupSkills?.sort();
    // Get the general group 
    context.generalGroup = this.object.system.fivePoint.groups.find((actorGroup) => actorGroup.name === "");
    if (!context.generalGroup) {
      context.generalGroup = {name: "", points: 0, narrow: true, levels: []};
    }
    return context;
  }

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".group-points").change(this._onPointsChange.bind(this));
    html.find(".broad-group").change(this._onBreadthChange.bind(this));
    html.find(".narrow-group").change(this._onBreadthChange.bind(this));
    html.find(".fp-group").click(this._onGroupClick.bind(this));
    html.find(".level-delete").click(this._onSkillLevelDelete.bind(this));
    html.find(".level-split").click(this._onSkillLevelSplit.bind(this));
    html.find(".group-delete").click(this._onGeneralGroupDelete.bind(this));
    html.find(".fp-apply").click(this._onClickApply.bind(this));
  }
  
  /** @inheritDoc */
  _onDragStart(event) {
    if (event.currentTarget.classList.contains("fp-skill") ||
        event.currentTarget.classList.contains("fp-skill-group")) {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        from: event.currentTarget.getAttribute("data-value")
      }));
    } else {
      super._onDragStart(event);
    }
  }

  /** @inheritDoc */
  async _onDrop(event) {
    if (event.toElement.classList.contains("skill-name")) {
      const data = TextEditor.getDragEventData(event);
      if (data.from) {
        try {
          const target = event.toElement.closest(".fp-skill-level");
          const index = target.getAttribute("data-value");
          if (this._setSkillLevel(this.selectedGroup, index, data.from)) {
            await this.object.update({"system.fivePoint": this.object.system.fivePoint});
          }
          
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.message);
        }
      }
    } else if (event.toElement.closest(".fp-general-group")) {
      const data = TextEditor.getDragEventData(event);
      if (data.from) {
        try {
          const group = data.from;
          if (this.object.system.fivePoint.addGroupToGeneral(group)) {
            await this.object.update({"system.fivePoint": this.object.system.fivePoint});      
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.message);
        }
      }

    } else {
      super._onDrop(event);
    }
  }

  // -------- Properties --------

  get groupData() {
    const data = [];
    for (const group in this.groups) {
      if (Object.prototype.hasOwnProperty.call(this.groups, group)) {
        const ag = this.object.system.fivePoint.groups.find((actorGroup) => actorGroup.name === group);
        data.push(ag ?? {name: group, points: 0, narrow: true, levels: []});
      }
    }
    data.sort(sortByName);
    return data;
  }

  // -------- Event Listeners --------

  _onGroupClick(event) {
    // Sets the selected group - these first three lines are the substnace of the action
    const label = event.currentTarget.querySelector(".name-row label");
    const [group] = label.getAttribute("for").split("-");
    this.selectedGroup = group === "General" ? "" : group;

    /*
     * Only forces a render if it wouldn't get one anyway.
     * Any click that effectively targets an input field (button, text input) already gets one
     */

    const labelFor = event.target.getAttribute("for");
    const isBreadthLabel = labelFor === `${group}-broad` || labelFor === `${group}-narrow`;
    if (
      event.target.id !== `${group}-broad` && 
      event.target.id !== `${group}-narrow` && 
      event.target.id !== `${group}-points` &&
      !isBreadthLabel
    ) {
      this.render();
    }
  }

async _onPointsChange(event) {
    let [group] = event.target.id.split("-");
    group = group === "General" ? "" : group;
    const pointsText = event.target.value.trim();
    if ((/^[\d]+$/u).test(pointsText)) {
      const points = group === "" 
        ? Math.min(parseInt(pointsText, 10), GENERAL_GROUP_LEVEL_CAP) 
        : Math.min(parseInt(pointsText, 10), OTHER_GROUP_LEVEL_CAP);
      event.target.value = points.toString();
      if (this.object.system.fivePoint.setGroupPoints(group, points, this._isGroupNarrow(group))) {
        await this.object.update({"system.fivePoint": this.object.system.fivePoint});
      }
    }
  }

  async _onBreadthChange(event) {
    let [group] = event.target.id.split("-");
    const points = parseInt(this.form.querySelector(`#${group}-points`).value.trim(), 10);
    group = group === "General" ? "" : group;
    if (this.object.system.fivePoint.setGroupPoints(group, points, this._isGroupNarrow(group))) {
      await this.object.update({"system.fivePoint": this.object.system.fivePoint});
    }
  }

  async _onSkillLevelDelete(event) {
    const target = event.target.closest(".fp-skill-level");
    const index = target.getAttribute("data-value");
    const selectedGroupData = this._getDataForGroup(this.selectedGroup);
    if (selectedGroupData && this.object.system.fivePoint.removeSkillFromLevel(this.selectedGroup, index)) {
      selectedGroupData.levels[index].name = "";
      await this.object.update({"system.fivePoint": this.object.system.fivePoint});
    }
  }

  async _onSkillLevelSplit(event) {
    const target = event.target.closest(".fp-skill-level");
    const index = target.getAttribute("data-value");
    const selectedGroupData = this._getDataForGroup(this.selectedGroup);
    if (selectedGroupData && this.object.system.fivePoint.splitSkillLevel(this.selectedGroup, index)) {
      await this.object.update({"system.fivePoint": this.object.system.fivePoint});
    }
    await Dialog.prompt({
      title: game.i18n.localize("FUDGERPG.FivePoint.UnsplitTitle"),
      content: game.i18n.localize("FUDGERPG.FivePoint.UnsplitContent"),
      label: "OK"
     });
  }

  async _onGeneralGroupDelete(event) {
    const [, indextext] = event.target.id.split("-");
    const index = parseInt(indextext, 10);
    if (this.object.system.fivePoint.removeGroupFromGeneral(index)) {
      // Find what skills remain available in the general group
      let groupSkills = [];
      for ( const group of this.object.system.fivePoint.generalGroups) {
        groupSkills = groupSkills.concat(this.groups[group]).sort();
      }
      // Remove any skills from the group's levels that are no longer available
      const groupData = this._getDataForGroup(this.selectedGroup);
      if (groupData) {
        for (const skill of groupData.levels) {
          if (!groupSkills.includes(skill.name)) {
            skill.name = "";
          }
        }
      }
      await this.object.update({"system.fivePoint": this.object.system.fivePoint});
    }
  }

  async _onClickApply() {
    await Dialog.confirm({
      title: game.i18n.localize("FUDGERPG.FivePoint.ConfirmTitle"),
      content: game.i18n.localize("FUDGERPG.FivePoint.ConfirmContent"),
      yes: () => this.object.replaceSkills(this.object.system.fivePoint.getSkillItems()),
      defaultYes: false
     });
     return true;
  }

  // -------- Methods --------

  _setSkillLevel(groupName, index, skillName) {
    const selectedGroupData = this._getDataForGroup(groupName);
    if (selectedGroupData && this.object.system.fivePoint.addSkillToLevel(groupName, index, skillName)) {
      selectedGroupData.levels[index].name = skillName;
      return true;
    }
    return false;
  }

  _getDataForGroup (groupName) {
    if (groupName === "") {
      const generalGroup = this.object.system.fivePoint.groups.find((aGroup) => aGroup.name === "");
      return generalGroup ?? {name: "", points: 0, narrow: true, levels: []};
    } 
    return this.groupData.find((group) => group.name === groupName);
  }

  _isGroupNarrow(group) {
    if (group !== "") {
      if (this.form.querySelector(`#${group}-broad`).checked) {
        return false;
      }
      if (this.form.querySelector(`#${group}-narrow`).checked) {
        return true;   
      }    
    }
    return null;
  }

  _formatLevelsForScreen(groupLevels) {
    return groupLevels.map((item) => ({name: item.name, level: this.object.getTraitLevelName(item.level)}));
  }
}
