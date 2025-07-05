# Fudge system for FoundryVTT

## 2.6.0 - Configurable Trait Ladders
- [FEATURE] Trait ladders are now user-creatable items. The trait ladder to use for a game can be selected in Settings.
- [FEATURE] Settings choices from compendia are now determined when you open settings rather than when you start the game.
- [BUGFIX] Issue creating new actor in V13 (rules on preCreate are now enforced.) Fix involved starting to use UUIDs.
- [BUGFIX] Wounds and five point character creation were mortally wounded since data model changes in 2.4
- [INTERNAL] Using UUID rather than _id to reference items looked up from packs is safer - applied it across the board.
- [INTERNAL] Consolidated handling of settings and compendia into their own modules. Root fudge.mjs now just carries all the hooks.

## 2.5.0 - Creation styles
- [FEATURE] Now provides configuration of character creation styles 
  - Character creation style affects what other config settings are relevant
  - Horse-trading points for 5-point Fudge is different than for objective character creation
  - There are no points to horse-trade at all for subjective character creation
- [BUGFIX] Cleaned up the last few deprecation warnings for Foundry 13

## 2.4.0 - Now undergirded by data models
- [FEATURE] Added field mana - no automation yet - in preparation for Fantasy Fudge magic
- [FEATURE] Tightened up trait values list to take less space.
- [INTERNAL] Based everything on data models
- [INTERNAL] Adjusted some internal structures - provided migration and adjusted compendia to reflect change

## 2.3.0 - Small Improvements
- [INFO] Updated README.md with pyramid dice information
- [FEATURE] Provide UI for images on items
- [BUGFIX] Cleaned up V12 console noise around pyramid die support

## 2.2.0 - Basic FoundryVTT 12 compatibility
- [FEATURE] Verified that it comes up cleanly in both FoundryVTT 11 and 12. (Please report any issues I missed - testing here is sadly not yet comprehensive.)

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
