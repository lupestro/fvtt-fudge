/* eslint-disable max-classes-per-file */


const {
  HTMLField, SchemaField, NumberField, StringField, ArrayField, BooleanField
} = foundry.data.fields;

const resourceField = function(initialValue, initialMax) {
  return {
        // Make sure to call new so you invoke the constructor!
    value: new NumberField({initial: initialValue}),
    max: new NumberField({initial: initialMax})
  };
};

class CharacterData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["FUDGERPG.Actor.Character"];

  static defineSchema() {
    return {
      fp: new NumberField({required: false, integer: true, min: 0, initial: 0}),
      ep: new NumberField({required: false, integer: true, min: 0, initial: 0}), 
      mana: new NumberField({required: false, integer: true, min: 0, initial: 0}), 
      wounds: new SchemaField({
          // eslint-disable-next-line no-magic-numbers
          scratch: new SchemaField(resourceField(0, 3)),
          // eslint-disable-next-line no-magic-numbers
          hurt: new SchemaField(resourceField(0, 2)),
          veryhurt: new SchemaField(resourceField(0, 1)),
          incapacitated: new SchemaField(resourceField(0, 1)),
          neardeath: new SchemaField(resourceField(0, 1))
      }),
      notes: new HTMLField(),
      unspent: new SchemaField({
        attrlevels: new NumberField({required: true, integer: true, min: 0, initial: 0}),
        skilllevels: new NumberField({required: true, integer: true, min: 0, initial: 0}),
        gifts: new NumberField({required: true, integer: true, min: 0, initial: 0}),
        faults: new NumberField({required: true, integer: true, min: 0, initial: 0})
      }, {required: false}),
      fivepoint: new SchemaField({
        unspent: new NumberField({required: true, integer: true, min: 0, initial: 5}),
        generalgroups: new ArrayField(new StringField(), {initial: []}),
        groups: new ArrayField(new SchemaField({
          // Group name
          name: new StringField({required: true}), 
          narrow: new BooleanField({required: true, initial: false}),
          points: new NumberField({required: true, integer: true, min: 0, initial: 0}),
          splits: new ArrayField(new NumberField({required: true, integer: true, min: -8, initial: 0})),
          levels: new ArrayField(new SchemaField({
            // Skill name
            name: new StringField({required: true}),
            level: new NumberField({required: true, integer: true, min: -8, initial: 0})
          }), {initial: []})
        }))
      })
    };
  }
}

export const registerActorDataModels = function () {
  CONFIG.Actor.dataModels.character = CharacterData;
};
