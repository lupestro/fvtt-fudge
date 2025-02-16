// BUG: Make this configurable in settings
const FUDGE_GROUP_POINTS = 5; 
const GENERAL_GROUP_POINT_CAP = 1;
const OTHER_GROUP_POINT_CAP = 4;
const MAX_GENERAL_GROUPS = 3;

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
const FUDGE_GENERAL_SKILL_LEVELS = [
  [[]],
  // eslint-disable-next-line no-magic-numbers
  [[FAIR, 3]]
];

/**
 * This is a copy of the system.fivepoint data with the methods necessary to manipulate it.
 * Collecting group skills, because it loads compendia, is inherently asynchronous.
 * All other methods are synchronous.
 * Typical workflow makes a set of related changes to the cache, updating system.fivepoint when done. 
 */
export default class FivePointCache {
   constructor(fivePoint) {
        if (fivePoint) {
            const newGroups = [];
            for (const group of fivePoint.groups) {
              if (group.points !== 0) {
                newGroups.push(group);
              }
            }
            this.unspent = fivePoint.unspent;
            this.generalgroups = fivePoint.generalgroups;
            this.groups = newGroups;
        } else {
            this.unspent = FUDGE_GROUP_POINTS;
            this.generalgroups = [];
            this.groups = [];
        }
    }
    
    // Public methods

    async collectGroupSkills() {
        const groupedSkills = {};
        const fivePointCompendium = game.settings.get("fudge-rpg", "fivepointskillcompendium");
        for (const pack of game.packs) {  
            if (pack.metadata.type === "Item" && pack.metadata.id === fivePointCompendium) {
                const skills = pack.index.filter((item) => item.type === "skill");
                for (const skill of skills ) {
                    // eslint-disable-next-line no-await-in-loop
                    const item = await pack.getDocument(skill._id);
                    if (item) {
                        for (const group of item.system.groups) {
                            this._pushItemGroupIntoGroupSkills(item.name, group, groupedSkills);                            
                        }
                    }
                }
            }
        }
        const localItems = game.items.filter((item) => item.type === "skill" && 
            item.system.group && groupedSkills[item.system.group]);
        for (const item of localItems) {
            groupedSkills[item.system.group].push(item.name);
            if (groupedSkills[item.system.group2]) {
                groupedSkills[item.system.group2].push(item.name);
            }
        }
        return groupedSkills;
    }

    getSkillItems() {
        const skills = {};
        const fivePointCompendium = game.settings.get("fudge-rpg", "fivepointskillcompendium");
        for (const aGroup of this.groups) {
            for (const aLevel of aGroup.levels) {
                if (aLevel.name !== "") {
                    skills[aLevel.name] = {level: aLevel.level, id: ""};
                }
            }
        }
        for (const pack of game.packs) {  
            if (pack.metadata.type === "Item") {
                const packSkills = 
                    pack.index.filter((item) => item.type === "skill" && pack.metadata.id === fivePointCompendium);
                for (const skill of packSkills ) {
                    if (skill.name in skills) {
                        skills[skill.name].id = skill._id;
                        skills[skill.name].pack = pack;
                    }
                }
            }
        }
        const localItems = game.items.filter((skill) => skill.type === "skill" && skill.name in skills);
        for (const item of localItems) {
            skills[item.name].id = item._id;
            skills[item.name].pack = null;
        }
        return skills;
    }

    addGroupToGeneral(groupName) {
    // Validate this is valid to do
        if (this.generalgroups.length === MAX_GENERAL_GROUPS || this.generalgroups.includes(groupName)) {
                return false;
        }
        const groupData = this.groups.find( (aGroup) => aGroup.name === groupName);
        if (groupData && groupData.points > 0) {
            return false;
        }
        this.generalgroups.push(groupName);
        this.generalgroups.sort();
        return true;
    }

    removeGroupFromGeneral(index) {
        if (index < 0 || index >= this.generalgroups.length) {
            return false;
        }
        this.generalgroups.splice(index, 1);
        return true;
    }

    addSkillToLevel(groupName, index, skillName) {
        const group = this.groups.find((aGroup) => aGroup.name === groupName);
        if (!group || index < 0 || index >= group.levels.length || skillName === "") {
            return false;
        }
        const existingLevels = [];
        this.groups.forEach((aGroup) => {
            const levelItem = aGroup.levels.find( (lvl) => lvl.name === skillName);
            if (levelItem) {
                existingLevels.push(levelItem);
            }
        });
        group.levels[index].name = skillName;
        for (const existingLevel of existingLevels) {
            existingLevel.name = "";
        }
        return true;
    }

    removeSkillFromLevel(groupName, index, skillName) {
        const group = this.groups.find((aGroup) => aGroup.name === groupName);
        if (!group || index < 0 || index >= group.levels.length) {
            return false;
        }
        if (typeof skillName !== "undefined" && group.levels[index].name !== skillName) {
            return false;
        }
        group.levels[index].name = "";
        return true;
    }

    splitSkillLevel(groupName, index) {
        const group = this.groups.find((aGroup) => aGroup.name === groupName);
        if (!group || index < 0 || index >= group.levels.length) {
            return false;
        }
        const newLevel = group.levels[index].level - 1;
        group.levels[index].level = newLevel;
        group.levels = [...group.levels.slice(0, index), {name: "", level: newLevel}, ...group.levels.slice(index)];
        group.levels.sort((first, second) => { 
            if (first.level < second.level) { 
                return 1; 
            }
            if (first.level > second.level) { 
                return -1; 
            }
            return 0;
        });
        return true;
    }

    setGroupPoints(groupName, points, narrow) {
        // Validate request- overdraft of unspent is permitted
        if (groupName === "" ? points > GENERAL_GROUP_POINT_CAP : points > OTHER_GROUP_POINT_CAP) {
            return false;
        }
        if (groupName !== "" && this.generalgroups.includes(groupName)) {
            return false;
        }
        // Perform it
        const levelsToApply = [];
        const groupLevels = groupName === "" 
            ? FUDGE_GENERAL_SKILL_LEVELS[points]
            : FUDGE_GROUP_SKILL_LEVELS[points][narrow ? 1 : 0];
        for (const [level, count] of groupLevels) {
            for (let index = 0; index < count; index += 1) {
                levelsToApply.push({name: "", level});
            }
        }
        const group = this.groups.find((aGroup) => aGroup.name === groupName);
        if (group) {
            group.points = points;
            group.narrow = narrow;
            group.levels = this._reconcileLevels(group.levels, levelsToApply);
        } else {
            this.groups.push({name: groupName, points, narrow, levels: levelsToApply});
        }
        this.groups.filter((aGroup) => aGroup.points > 0 );
        let spent = 0;
        for (const aGroup of this.groups) {
            spent += aGroup.points;
        }
        this.unspent = FUDGE_GROUP_POINTS - spent;
        return true;
    }

    // Private methods

    _pushItemGroupIntoGroupSkills(itemName, groupName, result) {
        if (groupName) {
            if (groupName in result) {
                result[groupName].push(itemName);
            } else {
                result[groupName] = [itemName];
            }
        }
    }
    
    _reconcileLevels(currentLevels, newLevels) {
        // Stretagy: spread them down the new list and drop what won't fit
        for (const level of currentLevels) {
            if (level.name !== "") {
                const targetLevel = newLevels.find( (aLevel) => aLevel.name === "");
                if (targetLevel) {
                    targetLevel.name = level.name;
                }
            }
        }
        return newLevels;
    }
}
