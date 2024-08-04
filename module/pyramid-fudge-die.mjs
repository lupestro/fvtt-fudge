/**
 * A type of DiceTerm used to represent a five-sided Fate/Fudge die.
 * Mathematically behaves like 1d5-3
 * @extends {foundry.dice.terms.DiceTerm}
 */
 const MIN_VALUE = -2;
 const MAX_VALUE = 2;
 const ZERO_OFFSET = 3;
 const VersionNeutralDiceTerm = foundry.dice.terms.DiceTerm ? foundry.dice.terms.DiceTerm : DiceTerm;
 const VersionNeutralDie = foundry.dice.terms.Die ? foundry.dice.terms.Die : Die;
 export default class PyramidFudgeDie extends VersionNeutralDiceTerm {
  constructor(termData) {
    super(termData);
    this.faces = 5;
  }

  /** @inheritdoc */
  static DENOMINATION = "p";

  /** @inheritdoc */
  static MODIFIERS = {
    "r": VersionNeutralDie.prototype.reroll,
    "rr": VersionNeutralDie.prototype.rerollRecursive,
    "k": VersionNeutralDie.prototype.keep,
    "kh": VersionNeutralDie.prototype.keep,
    "kl": VersionNeutralDie.prototype.keep,
    "d": VersionNeutralDie.prototype.drop,
    "dh": VersionNeutralDie.prototype.drop,
    "dl": VersionNeutralDie.prototype.drop
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
