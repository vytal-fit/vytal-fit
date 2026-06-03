import { test as teardown } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const authFile = path.join(__dirname, ".auth/user.json");

teardown("cleanup auth state", async () => {
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
  }
});
