/**
 * A type of DiceTerm used to represent a five-sided Fate/Fudge die.
 * Mathematically behaves like 1d5-3
 * @extends {foundry.dice.terms.DiceTerm}
 */

import {VNDiceTerm, VNDie} from "./ver-neutral.mjs";

 const MIN_VALUE = -2;
 const MAX_VALUE = 2;
 const ZERO_OFFSET = 3;

 export default class PyramidFudgeDie extends VNDiceTerm {
  constructor(termData) {
    super(termData);
    this.faces = 5;
  }

  /** @inheritdoc */
  static DENOMINATION = "p";

  /** @inheritdoc */
  static MODIFIERS = {
    "r": VNDie.prototype.reroll,
    "rr": VNDie.prototype.rerollRecursive,
    "k": VNDie.prototype.keep,
    "kh": VNDie.prototype.keep,
    "kl": VNDie.prototype.keep,
    "d": VNDie.prototype.drop,
    "dh": VNDie.prototype.drop,
    "dl": VNDie.prototype.drop
  };

   /* -------------------------------------------- */

  /** @inheritdoc */
  roll({minimize = false, maximize = false} = {}) {
    const roll = {result: 0, active: true};
    if ( minimize ) {
      roll.result = MIN_VALUE;
    } else if ( maximize ) {
      roll.result = MAX_VALUE;
    } else {
      const randomFace = CONFIG.Dice.randomUniform() * this.faces;
      roll.result = Math.ceil(randomFace - ZERO_OFFSET);
    }
    if ( roll.result === MIN_VALUE ) {
      roll.failure = true;
    }
    if ( roll.result === MAX_VALUE ) {
      roll.success = true;
    }
    this.results.push(roll);
    return roll;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getResultLabel(result) {
    return {
      "-2": "--",
      "-1": "-",
      "0": "&nbsp;",
      "1": "+",
      "2": "++"
    }[result.result];
  }
}
