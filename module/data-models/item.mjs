/* eslint-disable max-classes-per-file */

const {
  HTMLField, SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;

class FudgeItemData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item"];

  static defineSchema() {
    return {
      description: new HTMLField()
    };
  }
}

class TraitLadderData extends FudgeItemData {

  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item.TraitLadder"];

  static defineSchema() {
    return {
      ...super.defineSchema(),
      traits: new ArrayField(new SchemaField({
        name: new StringField({required:true}),
        value: new NumberField({required: true, integer: true, min: -8, initial: 0})
      }))
    };
  }
}

class AttributeSetData extends FudgeItemData {

  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item.AttributeSet"];

  static defineSchema() {
    return {
      ...super.defineSchema(),
      attributes: new ArrayField(new SchemaField({
        name: new StringField({required: true}),
        level: new NumberField({required: true, integer: true, min: -8, initial: 0})
      })),
      muscleweapon: new StringField({required: false}),
      damagecap: new StringField({required: false})
    };
  }
}

class SkillData extends FudgeItemData {
  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item.Skill"];

  static defineSchema() {
    return {
      ...super.defineSchema(),
      "level": new NumberField({required: false, integer: true, min: -8, initial: 0}),
      "groups": new ArrayField(new StringField(), {"required": false})
    };
  }
}

class GiftData extends FudgeItemData {
  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item.Gift"];

  static defineSchema() {
    return {
      ...super.defineSchema()
    };
  }
}

class FaultData extends FudgeItemData {
  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item.Fault"];

  static defineSchema() {
    return {
      ...super.defineSchema()
    };  
  }
}

class EquipmentData extends FudgeItemData {
  static LOCALIZATION_PREFIXES = ["FUDGERPG.Item.Equipment"];

  static defineSchema() {
    return {
      ...super.defineSchema(),
      "odf": new NumberField({required: false, integer: true, min: 0, initial: 0}),
      "ddf": new NumberField({required: false, integer: true, min: 0, initial: 0}),
      "quantity": new NumberField({required: false, integer: true, min: 0, initial: 0})
    };
  }
}

export const registerItemDataModels = function () {
  CONFIG.Item.dataModels.traitladder = TraitLadderData;
  CONFIG.Item.dataModels.attributeset = AttributeSetData;
  CONFIG.Item.dataModels.skill = SkillData;
  CONFIG.Item.dataModels.gift = GiftData;
  CONFIG.Item.dataModels.fault = FaultData;
  CONFIG.Item.dataModels.equipment = EquipmentData;
};
