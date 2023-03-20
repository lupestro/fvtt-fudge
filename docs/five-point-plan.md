# Five-Point Fudge Implementation Plan

## Work areas

* [x] Raw HTML/CSS Layout to discover data
* [ ] Activate worksheet from actor sheet

### Configuration Flow
* [ ] Configure sources of `SkillGroupSet` ** Note 1
* [ ] Build SkillGroupSet for popup from items and configured sources: `getSkillGroups`

### Worksheet Flow
* [ ] Popup displays raw HTML with CSS
* [ ] Save => Deliver `SkillLevel[]` back to actor sheet [from provided `FivePointData`]
* [ ] Save => Intercept with a confirmation dialog before proceeding
* [ ] Craft handlebars with {{#each}} & {{data}} to display FivePointData
* Event Handling:
  * [ ] Select Skill Group => display skills of group (right column)
  * [ ] Drag Skill Group to General Group => updates FivePointData generalGroups
  * [ ] Change Group Points => Set Skill Levels (center column) ** Note 2
  * [ ] Change Group Breadth => Set Skill Levels (center column) ** Note 2
  * [ ] Drag Skills to Skill Levels => Populate skill levels
  * [ ] Drag Skill Levels to Skill Levels => Swap skills in two levels
  * [ ] Click Delete Button on Skill Level => Depopulate the skill level
  * [ ] Click Split Button on Skill Level => Split to two of lower level, first populated
  * [ ] Click Join with Two Skill Levels selected => Join to one of higher level, none populated

### Persistence
* [ ] Populate initial `FivePointData` data from saved actor document
* [ ] Store updated `FivePointData` data to actor document on save

### Notes
1. Initially, select a single skill compendium
  * any skill items defined in the world that have groups will be dragged in as well
2. Changes in skill levels always:
  * keep the highest levels from the old scheme uppermost in the new scheme
  * drop the lowest things if there are insufficient slots
  * add empty slots at the bottom if insufficient data already populated

## Non-goals for this release

* Support for updating five-point data after the fact - for example:
  * Reducing before/after five-point arrangements to a set of increases/decreases
  * Then applying the change to actor sheet skills
  * Instead, updated five-point data always replaces entire set of skill data on the sheet

## Data Schema

The following Typescript captures, I think, everything we need for what we're trying to do:

``` typescript

// Base types
type GroupName = string;
type PointCount = number;
type Breadth = "Norrow" | "Broad";
type SkillName = string;
type SkillLevel = number;

// Structures
interface SkillLevel {
  name: SkillName; 
  level: SkillLevel;
};

interface SkillGroupSet {
  [GroupName]: SkillName[]
};

interface GroupPointDefinition {
  name: GroupName; // Empty name indicates this is the general group
  narrow: Breadth;  // Always "Narrow" for general group
  points: PointCount;
  skills: (SkillLevel | "")[] |; // Empty name indicates unfilled skill slot
};

interface FivePointData {
  generalGroups: GroupName[];
  groups: GroupPointDefinition[]; // Only groups with non-zero points are included
};

// Popup use modeled as a series of transform functions

const async function getSkillGroups(compendiumIds: string[], itemIds: string[]): SkillGroupSet;

const async function FivePointPopup({
  // inputs
  availableSkills: SkillGroupSet, 
  priorState: FivePointData
}) : {
  // outputs
  skillLevels: SkillLevel[], // Replaces the character sheet skill items
  updatedState: FivePointData;
}

const async function updateSkillsFromLevels(actor: Actor, skillLevels: SkillLevel[]);

```