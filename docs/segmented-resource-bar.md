# Segmented Resource Bar
This document describes the proposed design for a segmented resource bar for Fudge.

## General notion

### Resource bar
A resource bar under the token shows at a glance the health of the user. For Fudge, this needs to show how full each of the wound levels are. 

* A bar of fixed width, divided into segments for each wound level, in order of growing impact.
* The width of each segment is apportioned according to the number of checkboxes at that level.
* Each segment is in a different color, with a dark shade for checked wounds and a lighter shade for unchecked wounds.
* Here are some examples, based on a character with capacity for 4 scratches, 2 hurt, 2 very hurt, and one each for incapacitated and near death:
  * Fresh as a daisy: ![Segmented resource bar - full up](figures/segmented-fullup.svg)
  * Seen some battles: ![Segmented resource bar - mixed](figures/segmented-mixed.svg)
  * Holler for the medic! ![Segmented resource bar - ruh-roh](figures/segmented-ruh-roh.svg)

### Resource in Token HUD

The Token HUD provides a way to quickly change the wound levels. For this, what I have in mind is something like:
![Wound Boxes in HUD](figures/hud-boxes.png)

Each of the groups is a button that can be clicked to add one of that level or shift-clicked to remove one of that level. If a level is full, clicking that level puts an overflow into the next level that isn't full. 

### Non-goals

In the future, we may tag overflow boxes with the level of wound that was originally added, both in the Token HUD and in the character sheet. Thus, on your fifth Scratch, you could get a Hurt with an S in the box. This will probably be introduced when we introduce mechanics for healing, where the level of the original wound may start to matter.

Another feature that will not appear initially is condition tracking for the impacts of being incapacitated or near death. We know we need to do it eventually as we walk our way through all the facets of the performance and results of combat.

## Implementation

### Edges
The interception points needed for Fudge to implement this are relatively few:
* The use of Foundry resource bars is configurable, so everything `fudge-rpg` does about the resource bars needs to honor where the user chose to ask to track the `wounds` resource. It could be above or below the icon - or neither - or both.
* `fudge-rpg` will need to subclass the Foundry `Token` class. 
  * It will need to override `Token#drawBars()`, providing a custom implementation of the resource for wounds. By default, the token display doesn't show any bars right now.
  * When the user selects resources to display in the token config, the individual values for the levels of wounds appear in the list that the user selects from. The number of boxes for each level don't form a maximum, either, making them pretty useless. We need to ensure the list shows the aggregate value `wounds` rather than the individual levels.
* `fudge-rpg` will also need to subclass the Foundry `TokenHUD`.
  * This will give it the hooks to override the drawing of the HUD item associated with the resource for wounds.


The rest of this is [TBD] until we've studied the interception areas.