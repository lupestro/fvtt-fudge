# fvtt-fudge

This project implements a FUDGE system for Foundry Virtual Tabletop (FoundryVTT). 

## Using the System

Install the system. Build a world using the system. 
* Configure whether your world should use the standard, expanded, or extended trait levels. You must pick the attribute set to use (or create one of your own.) 
* Make characters and drag items onto them for attribute sets, skills, gifts, faults, and equipment. The compendia contain the traits used by Fantasy Fudge, supplied as OGL content. You may find them useful, or you can create your own items. 
* Use the 5-point Fudge worksheet with the Fantasy Fudge skill set (or your own compendium of skills) for easy skill selection. 
* Make a story, roll some dice, and take some damage. 

That's about it, but I've added a couple of extras.

### Pyramid Fudge Dice

This also adds a Fudge die that has arguably better characteristics for gameplay. 
* A Fudge die is essentially a d3, drawn on a d6, adjusted for a 0 center value 
* A Pyramid Fudge die is a d5, drawn on a D10, adjusted for a 0 center value, with the extra values being -- and ++.

You roll two of them, and this leads to a curve between -4 and +4 with fewer rolls on the center values and more rolls in the wings. 
More random outcomes lead to more interesting gameplay. 
In the following diagram, the f graph is the 4dF outcome and the p graph is the 2dP outcome.
```
25% +
    |                   f
    |
    |
    |
20% +              f    p    f
    |
    |
    |
    |              p         p
15% +
    |
    |
    |         pf                  fp
    |
10% +
    |
    |    p                             p
    |
    |
5%  +    f                             f
    p                                       p
    |
    |
    f                                       f
0%  +----+----+----+----+----+----+----+----+
   -4   -3   -2   -1    0    1    2    3    4
```
The "p" curve is a linear pyramid to a max of 20% at zero. The "f" curve is a sharp normal curve, with much lower 
probability at the edges, and a much sharper zero peak at 24%. Your odds of hitting numbers like -2 and +2 are the 
same with either type of roll, but your odds of hitting +/-3 or +/4 are really rare in the standard 4dF, with the 
probability concentrated between -1 and +1, which is just plain boring if you end up rolling a lot. 

You still won't hit the higher and lower values with 2dP nearly as often as you hit between -2 to +2, but your odds 
of -4 or +4 are roughly comparable to hitting 1 or 20 on a d20, so the crit experience is similar to D&D, and with the 
pyramid curve, the roleplaying experience is similar to a 2d6 system. This feels like the best of all possible worlds.

Meanwhile, all the values are still between -4 and +4, so nothing else in the system needs to be touched.

You can always roll 2dP or 4dF from the chat, but there is a configuration setting for which roll to use by default.
I built in what Dice So Nice needs to roll a D10 as a dP.

## Plan

I am developing this in distinct stages that could be released into the FoundryVTT ecosystem:
 1.  An editable character sheet that can be referred to in game, with editable items that can be dragged onto a character: attribute sets, skills, gifts, faults, and equipment. **[Done]**
 2.  Rollable attributes and skills with effect of wounds taken into account and named results in chat. **[Done]**
 3.  Bookkeeping support for objective character creation and 5-point Fudge. **[Done]** 
 4.  More automated combat mechanics where the players indicate what skill and weapon they are using for attack, what defense is being performed, and the system does the math and updates the sheets.
 5.  Modules for different FUDGE-based systems, with required licensing and perhaps even endorsement by the vendors.
 6.  Other features with their variations, like scale, speed, character advancement.

Stages 1 to 3 are complete. I'm not sure exactly how item 4 can be accomplished. Other systems struggle with it and come up with different strategies, but it is important. 
Item 6 comes after item 5 because, in an area where house rules dominate, we will need the flexibility mechanisms introduced with item 5 to implement it. 
One possibility is base rules in the system (which will satisfy only a few) with an option-intensive "house rules" module to bend things into whatever novel shapes that GM wants.

## Developer Journey 
I documented my process of developing this as I went in a Foundry journal, kept as a day-by-day log, after the manner an adventurer might chronicle his or her journeys. This journal and its collateral can be found in the Github repository fvtt-dev-journeys and installed as a module. 

I didn't include some of the final work of the first release in the journey. The trait rolls for the chat window underwent a couple of revisions that weren't captured. Trait level sets were, at that time, another type of per-character item, but I rolled them up into the system itself for simplicity and consistency. They are now a game-level setting with two predefined choices and one day will again be configurable.

I also didn't chronicle the extensive work that went into adding the five-point worksheet in a subsequent release or the work to adjust the build to the V11 database changes.

The module is intended to collect journals from a number of development efforts for Foundry and will hopefully give a "leg up" to other people writing a system or module for the first time, especially if they know programming and HTML individually but may be unfamiliar with the JS/CSS/HTML development ecosystems used for Foundry development.

## Contributing

I do not anticipate anybody joining me in this effort, at least until a first release is published for Foundry, so I won't include build instructions here, except to say we are using npm, gulp, babel, and eslint as our primary tool set, modeled on how the dnd5e system builds, only with a lot stripped out.
