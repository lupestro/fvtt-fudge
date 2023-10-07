 /**
 * A type of DiceTerm used to represent a five-sided Fate/Fudge die.
 * Mathematically behaves like 1d5-3
 * @extends {DiceTerm}
 */
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
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  roll({minimize=false, maximize=false}={}) {
    const roll = {result: undefined, active: true};
    if ( minimize ) roll.result = -2;
    else if ( maximize ) roll.result = 2;
    else roll.result = Math.ceil((CONFIG.Dice.randomUniform() * this.faces) - 3);
    if ( roll.result === -2 ) roll.failure = true;
    if ( roll.result === 2 ) roll.success = true;
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
