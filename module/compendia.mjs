
export const getAttributeSets = function () {
  const result = {};
  game.collections.get("Item")
    .filter((item) => item.type === "attributeset")
    .forEach( (item) => { 
      result[item.uuid] = {name: item.name, id: item._id, source: "Items"};
    });
  game.packs.forEach((pack) => {
    if (pack.metadata.type === "Item") {
      pack.index.filter((item) => item.type === "attributeset")
      .forEach( (item) => {
        result[item.uuid] = {name: item.name, id: item._id, source: pack.metadata.label};
      });
    }
  });
  return result;
};

export const getTraitLadders = function () {
  const result = {};
  game.collections.get("Item")
    .filter((item) => item.type === "traitladder")
    .forEach( (item) => { 
      result[item.uuid] = {name: item.name, id: item._id, source: "Items"};
    });
  game.packs.forEach((pack) => {
    if (pack.metadata.type === "Item") {
      pack.index.filter((item) => item.type === "traitladder")
      .forEach( (item) => {
        result[item.uuid] = {name: item.name, id: item._id, source: pack.metadata.label};
      });
    }
  });
  return result;
};

export const adjustAttributeSet = function(id, sets) {
  for (const item in sets) {
    if (sets[item].id === id) {
      return item;
    }
  }
  return null;
};

export const getSkillCompendia = function() {
  const result = {};
  game.packs.forEach((pack) => {
    if (pack.metadata.type === "Item" && pack.index.find((item) => item.type === "skill")) {
      result[pack.metadata.id] = pack.metadata.label;
    }
  });
  return result;
};

/* Returns promise */
export const getCompendiumAndLocalSkills = function(compendiumId) {
  const pack = game.packs.get(compendiumId);
  const skills = pack ? pack.index.filter((item) => item.type === "skill") : null;
  const docs = skills ? Promise.all(skills.map((skill) => pack.getDocument(skill._id))) : [];
  const localSkills = game.items.filter((item) => item.type === "Skill" );
  for (const skill of localSkills) {
    docs.push(skill);
  }
  return docs;
};

export const getCompendiumAndLocalSkillIndices = function(compendiumId) {
  const pack = game.packs.get(compendiumId);
  const skills = pack ? pack.index.filter((item) => item.type === "skill") : [];
  const localSkills = game.items.filter((item) => item.type === "Skill" );
  for (const skill of localSkills) {
    skills.push(skill);
  }
  return skills;
};
