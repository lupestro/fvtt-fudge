# Fudge system for FoundryVTT

## 2.2.0 - Basic FoundryVTT 12 compatibility
- [FEATURE] Verified that it at least comes up cleanly in both FoundryVTT 11 and 12 - not fully verified in V12 yet.

## 2.1.0  - Pyramid Fudge die and expanded trait ladder
- [FEATURE] Added another trait ladder - "Expanded" - has Legendary above Superb and Abysmal below Terrible - also added Abysmal to the larger "Extended" ladder.
- [EXPERIMENTAL] Pyramid die - roll 2dp rather than 4df for a more spread -4 to 4 probability curve. 

## 2.0.0    Five-Point Fudge support - now FoundryVTT 11 only
- [BREAKING] Requires FoundryVTT 11 
  * Fantasy Fudge Skill Compendium now has internal folders, but is much more usable for it. 
  * Will be adding internal folders for other compendia in the future where it makes sense.
- [FEATURE] Five-point Fudge worksheet: 
  * draws from configured skills compendium plus any game items that use the same groups.
  * skill group composition "as written" - not yet customizable
    * 5 group points to spend
    * narrow and broad groups of 1-4 points
    * skills from 1-3 designated groups in a one-point general group
  * supports skill splits - unsplitting still a bit primitive but managable
  * feeds skills to main sheet with a click and a confirmation

## 1.4.0    FoundryVTT 11 support
- [FEATURE] Bumped to support both FoundryVTT 10 and 11

## 1.3.0    Drag and Drop support within character sheet
- [FEATURE] Drag and drop to reorder lists in character sheet
- [FEATURE] Drag and drop to "horse-trade" unused levels
- [CLEANUP] "Stats" wasn't translated. Renamed it to "General Traits"
- [BUGFIX] Rolls in chat history now appear properly on startup

## 1.2.0    A few features to grease play that didn't get into 1.1
- [FEATURE] Character portrait
- [FEATURE] Default attribute set upon character creation
- [FEATURE] Objective character creation with settable initial skill and attribute levels and gifts.

## 1.1.0    Incorporate issues raised in private playtest and re-brand for uniqueness
- [BREAKING] Needed to rebrand to "fudge-rpg" before publishing - the id "fudge" was already taken by a small module.
- [FEATURE] Clicking item names brings up item sheets
- [BUGFIX] Dropdown display collapsed to nothing when narrowing actor sheet
- [BUGFIX] Addressed usability issues with edit areas
- [BUGFIX] Removed vestiges of unimplemented feature for simple actors

## 1.0.0    Initial public release - basic Fudge
Everything you should need to play a game using subjective character creation.
- [FEATURE] Standard Fudge character sheet - Drag items onto sheet for traits and equipment. Click die next to attribute or skill to roll.
- [FEATURE] Rolled results automatically apply modifiers for levels and wounds and are expressed as names.
- [FEATURE] Compendia provide all the traits defined by Fantasy Fudge.
- [FEATURE] Choose to use standard or extended trait levels

## What isn't yet available in the current release:

  - Character traits:
    - **strength / mass / speed scale.**
    - powers as separate from gifts.
    - mechanism for supplying custom traits.
  - Character creation:
    - sample equipment.
    - sample actors.
  - Combat flow: 
    - **assessing combat exchanges to apply wounds.**
    - wound bar on resources
  - Character development:
    - **basic EP management** 
    - variants specified in SRD

For now, these need to be managed by hand but none of them should outright prevent play. 
* If you need to use scale, it may require adjusting rolls appearing in chat in order to compare them across species. 
* The others should have little to no impact during play.
* The ones in bold have my attention as the next things to tackle, though, for good reason.

Once the base system is relatively complete, our vision is to support specific Fudge-based systems as modules, 
provided we get the right licensing to do it.
