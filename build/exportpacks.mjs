// Adapted from the pushLDBtoYML.mjs script from @ChaosOS on Foundry Discord
import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const MODULE_ID = process.cwd();

const packs = await fs.readdir("./packs");
for (const pack of packs) {
  if (pack === ".gitattributes") continue;
  console.log("Unpacking " + pack);
  const directory = `./packs-srcnew/${pack}`;
  try {
    for (const file of await fs.readdir(directory)) {
      await fs.unlink(path.join(directory, file));
    }
  } catch (error) {
    if (error.code === "ENOENT") console.log("No files inside of " + pack);
    else console.log(error);
  }
  await extractPack(
    `${MODULE_ID}/packs/${pack}`,
    `${MODULE_ID}/packs-srcnew/${pack}`
  );
}