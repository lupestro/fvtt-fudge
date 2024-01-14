// Adapted from the pullYMLtoLDB.mjs script from @ChaosOS on Foundry Discord
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";

const MODULE_ID = process.cwd();

const packs = await fs.readdir("./packs/src");
for (const pack of packs) {
  if (pack === ".gitattributes") continue;
  console.log("Packing " + pack);
  await compilePack(
    `${MODULE_ID}/packs/src/${pack}`,
    `${MODULE_ID}/packs/${pack}`
  );
}