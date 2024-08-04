// Adapted from the pullYMLtoLDB.mjs script from @ChaosOS on Foundry Discord
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";

const MODULE_ID = process.cwd();

const packs = await fs.readdir("./packs/src");
const packlist = packs.map((pack)=> {
  // eslint-disable-next-line no-console
  console.log("Starting packing: ", pack);
  return compilePack(
    `${MODULE_ID}/packs/src/${pack}`,
    `${MODULE_ID}/packs/${pack}`
  ).then(() => {
  // eslint-disable-next-line no-console
    console.log("Completed packing: ", pack);
  });
});
await Promise.all(packlist);
