const OBJECTIVE_LEVEL_TRADES = {
  "skill-points:attribute-points": "3/1",
  "skill-points:gift-points": "6/1",
  "skill-points:fault-points": "-6/1",
  "attribute-points:skill-points": "1/3",
  "attribute-points:gift-points": "2/1",
  "attribute-points:fault-points": "-2/1",
  "gift-points:skill-points": "1/6",
  "gift-points:attribute-points": "1/2",
  "gift-points:fault-points": "-1/1",
  "fault-points:skill-points": "1/-6",
  "fault-points:attribute-points": "1/-2",
  "fault-points:gift-points": "1/-1"
};
const FIVEPOINT_LEVEL_TRADES = {
  "attribute-points:gift-points": "1/1",
  "attribute-points:fault-points": "-1/1",
  "gift-points:attribute-points": "1/1",
  "gift-points:fault-points": "-1/1",
  "fault-points:attribute-points": "1/-1",
  "fault-points:gift-points": "1/-1"
};
const LEVEL_TRADES = {
    "objective": OBJECTIVE_LEVEL_TRADES,
    "fivepoint": FIVEPOINT_LEVEL_TRADES,
    "subjective": {}
};

const TRADE_PROPS = {
  "attribute-points": "system.unspent.attrlevels",
  "gift-points": "system.unspent.gifts",
  "skill-points": "system.unspent.skilllevels",
  "fault-points": "system.unspent.faults"
};

export const tradePoints = function(fromElement, toElement) {
  const updatedValues = {};
  const trades = LEVEL_TRADES[game.settings.get("fudge-rpg", "creationstyle")];
  if (fromElement.id === toElement.id) {
    throw new Error(`Dragged to self: ${toElement.id}`);
  } else if (trades[`${fromElement.id}:${toElement.id}`]) {
    const trade = trades[`${fromElement.id}:${toElement.id}`]
      .split("/")
      .map((item) => parseFloat(item));
    const fromValue = parseFloat(fromElement.value);
    const toValue = parseFloat(toElement.value);
    if (!isNaN(fromValue) && !isNaN(toValue)) {
      if (fromValue >= trade[0]) {
        updatedValues[TRADE_PROPS[fromElement.id]] = fromValue - trade[0];
        updatedValues[TRADE_PROPS[toElement.id]] = toValue + trade[1];
      } else {
        throw new Error(`Not enough points for trade: ${fromElement.id} -> ${toElement.id}`);
      }
    }
  }
  return updatedValues;
};
