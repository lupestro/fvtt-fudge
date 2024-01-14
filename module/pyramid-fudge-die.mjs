 /**
  * A type of DiceTerm used to represent a five-sided Fate/Fudge die.
  * Mathematically behaves like 1d5-3
  * @extends {DiceTerm}
  */
 const MIN_VALUE = -2;
 const MAX_VALUE = 2;
 const ZERO_OFFSET = 3;
export default class PyramidFudgeDie extends DiceTerm {
  constructor(termData) {
    super(termData);
    this.faces = 5;
  }

  /** @inheritdoc */
  static DENOMINATION = "p";

  /** @inheritdoc */
  static MODIFIERS = {
    "r": Die.prototype.reroll,
    "rr": Die.prototype.rerollRecursive,
    "k": Die.prototype.keep,
    "kh": Die.prototype.keep,
    "kl": Die.prototype.keep,
    "d": Die.prototype.drop,
    "dh": Die.prototype.drop,
    "dl": Die.prototype.drop
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
