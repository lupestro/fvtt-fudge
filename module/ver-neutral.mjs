// Types - in alpha order

export const VNActorSheet = 
  foundry.appv1?.sheets?.ActorSheet 
    ? foundry.appv1.sheets.ActorSheet 
    : ActorSheet;

export const VNItemSheet = 
  foundry.appv1?.sheets.ItemSheet 
  ? foundry.appv1.sheets.ItemSheet 
  : ItemSheet;

export const VNDiceTerm = 
  foundry.dice.terms.DiceTerm 
    ? foundry.dice.terms.DiceTerm 
    : DiceTerm;

export const VNDie = 
  foundry.dice.terms.Die 
    ? foundry.dice.terms.Die 
    : Die;

export const VNTextEditor = 
  foundry.applications?.ux?.TextEditor.implementation 
  ? foundry.applications.ux.TextEditor.implementation 
  : TextEditor;

export const VNActors = 
  foundry.documents?.collections?.Actors 
  ? foundry.documents.collections.Actors 
  : Actors;
export const VNItems = 
  foundry.documents?.collections?.Items 
  ? foundry.documents.collections.Items 
  : Items;

// Functions - in alpha order

export const vnFromUuid =
  foundry.utils?.fromUuid
    ? foundry.utils.fromUuid
    : fromUuid;

export const vnRenderTemplate = 
  foundry.applications?.handlebars?.renderTemplate
    ? foundry.applications.handlebars.renderTemplate
    : renderTemplate;

export const vnLoadTemplates = 
  foundry.applications?.handlebars?.loadTemplates
  ? foundry.applications.handlebars.loadTemplates
  : loadTemplates;
