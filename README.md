# fvtt-fudge

This project implements a FUDGE system for Foundry Virtual Tabletop (FoundryVTT). 

At present, it is *very much* a work in progress, having only been started a few days ago.

I am developing this in distinct stages that could be released into the FoundryVTT ecosystem:
 1.  An editable character sheet that can be referred to in game. _[The goal I am working **now**]_
 2.  Manual combat mechanics presented in a way that makes it easy to handle the back and forth of attack, defend, relative degree with modifiers, and damage.
 3.  Direct editing of items: trait-level sets, attribute sets, skills, gifts, faults, and equipment. 
 4.  More automated combat mechanics where the players indicate what skill and weapon they are using for attack, what defense is being performed, and the system does the math and updates the sheets.
 5.  Modules for different FUDGE-based systems, with permission and perhaps even endorsement by the vendors.

When I have the minimum viable product, I will publish on FoundryVTT. I suspect the minimum viable product for use will include items 1, 2, and perhaps 3. I will not be versioning my work here until that point and code will be released to Foundry, not published to NPM.

I am documenting my process of developing this as I go in a Foundry journal, kept as a day-by-day log, after the manner an adventurer might chronicle his or her journeys. This journal and its collateral can be found in the module fvtt-dev-journeys with its own GitHub repository ([TBD]).

The module is intended to collect the journals from a number of development efforts for Foundry and will hopefully give a "leg up" to other people writing a system or module for the first time, especially if they know programming and HTML individually but may be unfamiliar with the JS/CSS/HTML development ecosystems used for Foundry development.

I do not anticipate anybody joining me in this effort, at least until a first release is published for Foundry, so I won't include build instructions here, except to say we are using npm, gulp, babel, and eslint as our primary tool set.