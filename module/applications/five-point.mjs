/* eslint max-lines: 0 */

// eslint-disable-next-line sort-vars
const SUPERB = 3, 
// eslint-disable-next-line sort-vars
GREAT = 2, 
// eslint-disable-next-line sort-vars
GOOD = 1, 
// eslint-disable-next-line sort-vars
FAIR = 0, 
// eslint-disable-next-line sort-vars
MEDIOCRE = -1;

// BUG: Make this configurable in settings
const FUDGE_GROUP_POINTS = 5; 
const GENERAL_GROUP_LEVEL_CAP = 1;
const OTHER_GROUP_LEVEL_CAP = 4;
const MAX_GENERAL_GROUPS = 3;

const FUDGE_GROUP_SKILL_LEVELS = [
  [[], []],
  // eslint-disable-next-line no-magic-numbers
  [[[FAIR, 3], [MEDIOCRE, 1]], [[GOOD, 1], [MEDIOCRE, 1]]],
  // eslint-disable-next-line no-magic-numbers
  [[[GOOD, 2], [FAIR, 4]], [[GREAT, 1], [GOOD, 1], [FAIR, 1]]],
  // eslint-disable-next-line no-magic-numbers
  [[[GREAT, 1], [GOOD, 3], [FAIR, 4]], [[GREAT, 1], [GOOD, 3], [FAIR, 4]]],
  // eslint-disable-next-line no-magic-numbers
  [[[SUPERB, 1], [GREAT, 2], [GOOD, 3], [FAIR, 3]], [[SUPERB, 1], [GREAT, 2], [GOOD, 3], [FAIR, 3]]
  ]
];
// eslint-disable-next-line no-magic-numbers
const FUDGE_GENERAL_SKILL_LEVELS = [[FAIR, 3]];

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
    this.groups ??= await this._collectGroupSkills();
    context.selectedGroup = this.selectedGroup;
    context.groupData = this.groupData;
    const selectedGroupData = this.groupData.find((group) => group.name === this.selectedGroup);
    if (this.selectedGroup === "General") {
      context.selectedGroupLevels = this.object.system.fivePoint.generalPoints 
      ? [{name: "", level: "Fair"}, {name: "", level: "Fair"}, {name: "", level: "Fair"}]
      : [];
      context.groupSkills = [];
      for ( const group of this.object.system.fivePoint.generalGroups) {
        context.groupSkills = context.groupSkills.concat(this.groups[group]);
      }
    } else {
      context.selectedGroupLevels = selectedGroupData?.levels ?? [];
      context.groupSkills = this.groups[this.selectedGroup];
    }
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".group-points").change(this._onPointsChange.bind(this));
    html.find(".broad-group").change(this._onBreadthChange.bind(this));
    html.find(".narrow-group").change(this._onBreadthChange.bind(this));
    html.find(".fp-group").click(this._onGroupClick.bind(this));
    html.find(".level-delete").click(this._onSkillLevelDelete.bind(this));
    html.find(".group-delete").click(this._onGeneralGroupDelete.bind(this));
    html.find(".fp-apply").click(this._onClickApply.bind(this));
  }
  
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

  async _onDrop(event) {
    if (event.toElement.classList.contains("skill-name")) {
      const data = TextEditor.getDragEventData(event);
      if (data.from) {
        try {
          const target = event.toElement.closest(".fp-skill-level");
          const index = target.getAttribute("data-value");
          const selectedGroupData = this.groupData.find((group) => group.name === this.selectedGroup);
          const objectGroupData = 
            this.object.system.fivePoint.groups.find((group) => group.name === this.selectedGroup);
          if (selectedGroupData && objectGroupData) {
            selectedGroupData.levels[index].name = data.from;
            objectGroupData.levels[index].name = data.from;  
          }
          await this.object.update({"system.fivePoint": this.object.system.fivePoint});
          
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
          if (this.object.system.fivePoint.generalGroups.length < MAX_GENERAL_GROUPS &&
              !this.object.system.fivePoint.generalGroups.includes(group) &&
              !this.object.system.fivePoint.groups.find((gp) => gp.name === group )
          ) {
              this.object.system.fivePoint.generalGroups.push(group);
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
    return data;
  }

  // -------- Methods --------

  async _collectGroupSkills() {
    const result = {};
    for (const pack of game.packs) {  
      if (pack.metadata.type === "Item") {
        const skills = pack.index.filter((item) => item.type === "skill");
        for (const skill of skills ) {
          // eslint-disable-next-line no-await-in-loop
          const item = await pack.getDocument(skill._id);
          if (item) {
            this._pushItemGroupIntoGroupSkills(item.name, item.system.group, result);
            this._pushItemGroupIntoGroupSkills(item.name, item.system.group2, result);
          }
        }
      }
    }
    return result;
  }

  _pushItemGroupIntoGroupSkills(itemName, groupName, result) {
    if (groupName) {
      if (groupName in result) {
        result[groupName].push(itemName);
      } else {
        result[groupName] = [itemName];
      }
    }
  }

  _recalculateRemainingGroupPoints() {
    const groups = this.form.querySelectorAll(".group-points");
    let total = 0;
    let valid = true;
    for (const group of groups) {
      valid = valid && (/^[\d]+$/u).test(group.value.trim());
      if (!valid) {
        break;
      }
      total += parseInt(group.value.trim(), 10);
    }
    if (valid) {
      const unspent = this.form.querySelector("#unspent-points");
      const unspentValue = FUDGE_GROUP_POINTS - total;
      if (unspentValue < 0) {
        unspent.parentElement.classList.add("overdraft");
      } else {
        unspent.parentElement.classList.remove("overdraft");
      }
      return unspentValue;
    }
    return this.object.system.fivePoint.unspent;
  }

  _getGroupBreadth(group) {
    if (group !== "General") {
      const broad = this.form.querySelector(`#${group}-broad`);
      const narrow = this.form.querySelector(`#${group}-narrow`);
      if (broad.checked) {
        return "broad";
      }
      if (narrow.checked) {
        return "narrow";   
      }    
    }
    return "";
  }

  _negotiateSkills(oldLevels, newLevels) {
    return newLevels;
  }

  _resetGroupLevels(group, breadth, points) {
    // TEST console.log(`Group: ${group}, Breadth: ${breadth}, Points: ${points}`);
    const newSkillLevelPlan = group === "General" 
      ? FUDGE_GENERAL_SKILL_LEVELS 
      : FUDGE_GROUP_SKILL_LEVELS[points][breadth === "narrow" ? 1 : 0];
    const systemGroup = this.object.system.fivePoint.groups.find((fpGroup) => fpGroup.name === group );

    const newLevels = [];
    for (const item of newSkillLevelPlan) {
      for (let count = 0; count < item[1]; count += 1) {
        newLevels.push({name: "", level: this._getTraitLevelName(parseInt(item[0], 10))});
      }
    }
  
    // TEST console.log(`Level Plan: ${JSON.stringify(newSkillLevelPlan)}`);
    const newGroups = [];
    let foundGroup = false;
    for (const aGroup of this.object.system.fivePoint.groups) {
      if (aGroup.name === group) {
        if (points > 0) {
          newGroups.push({ 
            name: group, 
            points, 
            narrow: breadth === "narrow", 
            levels: this._negotiateSkills(systemGroup?.levels, newLevels)
          });
        }
        foundGroup = true;
      } else if (aGroup.points > 0) { 
        newGroups.push(aGroup);
      }
    }
    if (!foundGroup) {
      newGroups.push({
        name: group,
        points,
        narrow: breadth === "narrow",
        levels: newLevels
      });
    }
    return newGroups;
  }

  _getTraitLevelName(value) {
    return this.object.system.traitlevels.find((level) => level.value === value).name;
  }
  
  // -------- Event Listeners --------

  _onGroupClick(event) {
    const label = event.currentTarget.querySelector(".name-row label");
    const [group] = label.getAttribute("for").split("-");
    this.selectedGroup = group;
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
    const [group] = event.target.id.split("-");
    const pointsText = event.target.value.trim();
    if ((/^[\d]+$/u).test(pointsText)) {
      let points = parseInt(pointsText, 10);
      points = group === "General" 
      ? Math.min(points, GENERAL_GROUP_LEVEL_CAP) 
      : Math.min(points, OTHER_GROUP_LEVEL_CAP);
      event.target.value = points.toString();
      if (group === "General") {
        this.object.system.fivePoint.generalPoints = points;
      } else if (points > 0) {
        const index = this.object.system.fivePoint.generalGroups.indexOf(group);
        if (index > -1) {
          this.object.system.fivePoint.generalGroups.splice(index, 1);
        }
      } 
      this.object.system.fivePoint.groups = this._resetGroupLevels(group, this._getGroupBreadth(group), points);
      this.object.system.fivePoint.unspent = this._recalculateRemainingGroupPoints();
      await this.object.update({"system.fivePoint": this.object.system.fivePoint});
    }
  }

  async _onBreadthChange(event) {
    const [group] = event.target.id.split("-");
    const points = parseInt(this.form.querySelector(`#${group}-points`).value.trim(), 10);
    this.object.system.fivePoint.groups = this._resetGroupLevels(group, this._getGroupBreadth(group), points);
    await this.object.update({"system.fivePoint": this.object.system.fivePoint});
  }

  async _onSkillLevelDelete(event) {
    const target = event.target.closest(".fp-skill-level");
    const index = target.getAttribute("data-value");
    const selectedGroupData = this.groupData.find((group) => group.name === this.selectedGroup);
    const objectGroupData = this.object.system.fivePoint.groups.find((group) => group.name === this.selectedGroup);
    if (selectedGroupData && objectGroupData) {
      selectedGroupData.levels[index].name = "";
      objectGroupData.levels[index].name = "";  
    }
    await this.object.update({"system.fivePoint": this.object.system.fivePoint});
  }

  async _onGeneralGroupDelete(event) {
    const [, indextext] = event.target.id.split("-");
    const index = parseInt(indextext, 10);
    this.object.system.fivePoint.generalGroups.splice(index, 1);
    await this.object.update({"system.fivePoint": this.object.system.fivePoint});
  }
  async _onClickApply(event) {
    let d = new Dialog({
      title: "Are you sure?",
      content: "<p>Continuing will replace the skills in your character sheet with the skills in this dialog, and will set your remaining skill points to zero.</p>" +
       "<p><b>Are you sure you want to do this?</b></p>",
      buttons: {
       cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => console.log("Canceled")
       },
       continue: {
        icon: '<i class="fas fa-check"></i>',
        label: "Continue",
        callback: () => console.log("Continuing")
       }
      },
      default: "cancel",
      render: html => console.log("Register interactivity in the rendered dialog"),
      close: html => console.log("This always is logged no matter which option is chosen")
     });
     d.render(true);
     return true;
  }
}
