import {
    getCompendiumAndLocalSkills, 
    getCompendiumAndLocalSkillIndices
} from "./compendia.mjs";

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

/* 
 * 0-4 group points: [
 * [Narrow [Level, Count],...], 
 * [Broad: [Level, Count],...]]
 * ]
 */
const FUDGE_GROUP_SKILL_LEVELS = [
  [[], []], 
  [
    // eslint-disable-next-line no-magic-numbers
    [[FAIR, 3], [MEDIOCRE, 1]], 
    // eslint-disable-next-line no-magic-numbers
    [[GOOD, 1], [MEDIOCRE, 1]]
  ],
  [
    // eslint-disable-next-line no-magic-numbers
    [[GOOD, 2], [FAIR, 4]], 
    // eslint-disable-next-line no-magic-numbers
    [[GREAT, 1], [GOOD, 1], [FAIR, 1]]
  ],
  [
    // eslint-disable-next-line no-magic-numbers
    [[GREAT, 1], [GOOD, 3], [FAIR, 4]], 
    // eslint-disable-next-line no-magic-numbers
    [[GREAT, 1], [GOOD, 3], [FAIR, 4]]
  ],
  [
    // eslint-disable-next-line no-magic-numbers
    [[SUPERB, 1], [GREAT, 2], [GOOD, 3], [FAIR, 3]], 
    // eslint-disable-next-line no-magic-numbers
    [[SUPERB, 1], [GREAT, 2], [GOOD, 3], [FAIR, 3]]
  ]
];
const FUDGE_GENERAL_SKILL_LEVELS = [
  [[]],
  // eslint-disable-next-line no-magic-numbers
  [[FAIR, 3]]
];

/**
 * This is a copy of the system.fivepoint data with the methods necessary 
 * to manipulate it. Collecting group skills, because it loads compendia, 
 * is inherently asynchronous. All other methods are synchronous.
 * Typical workflow makes a set of related changes to the cache, 
 * updating system.fivepoint when done. 
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
        const groupSkills = {};
        const compId = game.settings.get("fudge-rpg", "fivepointskillcompendium");
        // We need to load the whole skill because we need access to its groups
        const skills = await getCompendiumAndLocalSkills(compId);
        for (const skill of skills) {
            for (const group of skill.system.groups) {
                if (group in groupSkills) {
                    groupSkills[group].push(skill.name);
                } else {
                    groupSkills[group] = [skill.name];
                }
            }
        }
        return groupSkills;
    }

    getSkillItems() {
        const skills = {};
        for (const group of this.groups) {
            for (const level of group.levels) {
                if (level.name !== "") {
                    skills[level.name] = {level: level.level, uuid: ""};
                }
            }
        }
        const compId = game.settings.get("fudge-rpg", "fivepointskillcompendium");
        const packSkills = getCompendiumAndLocalSkillIndices(compId);
        for (const skill of packSkills ) {
            if (skill.name in skills) {
                skills[skill.name].uuid = skill.uuid;
            }
        }
        return skills;
    }

    addGroupToGeneral(groupName) {
    // Validate this is valid to do
        if (this.generalgroups.length === MAX_GENERAL_GROUPS || 
            this.generalgroups.includes(groupName)) {
                return false;
        }
        const groupData = 
            this.groups.find( (aGroup) => aGroup.name === groupName);
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
        if (!group || index < 0 || index >= group.levels.length ) {
            return false;
        }
        if (skillName === "") {
            return false;
        }
        const existingLevels = [];
        this.groups.forEach((aGroup) => {
            const levelItem = 
                aGroup.levels.find( (lvl) => lvl.name === skillName);
            if (levelItem) {
                existingLevels.push(levelItem);
            }
        });
        // Remove first in case we're overwriting the name at the same index
        for (const existingLevel of existingLevels) {
            existingLevel.name = "";
        }
        group.levels[index].name = skillName;
        return true;
    }

    removeSkillFromLevel(groupName, index, skillName) {
        const group = this.groups.find((aGroup) => aGroup.name === groupName);
        if (!group || index < 0 || index >= group.levels.length) {
            return false;
        }
        if (typeof skillName !== "undefined" && 
            group.levels[index].name !== skillName) {
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
        group.levels = 
            [...group.levels.slice(0, index), 
             {name: "", level: newLevel}, 
             ...group.levels.slice(index)];
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
        if (groupName === "" 
                ? points > GENERAL_GROUP_POINT_CAP 
                : points > OTHER_GROUP_POINT_CAP) {
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
            group.levels = this.#reconcileLevels(group.levels, levelsToApply);
        } else {
            this.groups.push({
                name: groupName, 
                points, 
                narrow, 
                levels: levelsToApply});
        }
        // ??? We're doing a filter and then throwing the result away?
        this.groups.filter((aGroup) => aGroup.points > 0 );
        let spent = 0;
        for (const aGroup of this.groups) {
            spent += aGroup.points;
        }
        this.unspent = FUDGE_GROUP_POINTS - spent;
        return true;
    }

    // Private methods

    #reconcileLevels(currentLevels, newLevels) {
        // Stretagy: spread them down the new list and drop what won't fit
        for (const level of currentLevels) {
            if (level.name !== "") {
                const targetLevel = 
                    newLevels.find( (aLevel) => aLevel.name === "");
                if (targetLevel) {
                    targetLevel.name = level.name;
                }
            }
        }
        return newLevels;
    }
}
