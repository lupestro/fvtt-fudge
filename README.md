# fvtt-fudge

This project implements a FUDGE system for Foundry Virtual Tabletop (FoundryVTT). 

## Using the System

Install the system. Build a world using the system. Configure whether your world should use the standard or extended trait levels. Make characters and drag items onto them for attribute sets, skills, gifts, faults, and equipment. You must pick the attribute set to use (or create one of your own.) The compendia contain the traits used by Fantasy Fudge, supplied as OGL content. You may find them useful, or you can create your own items. Make a story, roll some dice, and take some damage. That's about it.

## Plan

I am developing this in distinct stages that could be released into the FoundryVTT ecosystem:
 1.  An editable character sheet that can be referred to in game, with editable items that can be dragged onto a character: attribute sets, skills, gifts, faults, and equipment. **[Done]**
 2.  Rollable attributes and skills with effect of wounds taken into account and named results in chat. **[Done]**
 3.  Bookkeeping support for objective character creation, 5-point Fudge, and character advancement.
 4.  More automated combat mechanics where the players indicate what skill and weapon they are using for attack, what defense is being performed, and the system does the math and updates the sheets.
 5.  Modules for different FUDGE-based systems, with required licensing and perhaps even endorsement by the vendors.

Stages 1 and 2 are complete and I think this constitutes a minimum viable product, so I am shipping it. Item 3 is a priority that will ship in one or more updates. I'm not sure exactly how item 4 can be accomplished. Other systems struggle with it and come up with different strategies, but it is important.

## Developer Journey 
I documented my process of developing this as I went in a Foundry journal, kept as a day-by-day log, after the manner an adventurer might chronicle his or her journeys. This journal and its collateral can be found in the Github repository fvtt-dev-journeys and installed as a module. 

I didn't include some of the final work of the first release in the journey. The trait rolls for the chat window underwent a couple of revisions that weren't captured. Trait level sets were, at that time, another type of per-character item, but I rolled them up into the system itself for simplicity and consistency.

The module is intended to collect journals from a number of development efforts for Foundry and will hopefully give a "leg up" to other people writing a system or module for the first time, especially if they know programming and HTML individually but may be unfamiliar with the JS/CSS/HTML development ecosystems used for Foundry development.

## Contributing

I do not anticipate anybody joining me in this effort, at least until a first release is published for Foundry, so I won't include build instructions here, except to say we are using npm, gulp, babel, and eslint as our primary tool set, modeled on how the dnd5e system builds, only with a lot stripped out.
