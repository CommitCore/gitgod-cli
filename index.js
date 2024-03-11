#!/usr/bin/env node
import { exec } from "child_process";

function gitgod(command) {
  switch (command) {
    case "run":
      break;
    case "hello":
      exec("node hello.js", (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing hello.js: ${error}`);
          return;
        }
        console.log(`hello.js output: ${stdout}`);
        if (stderr) {
          console.error(`hello.js error: ${stderr}`);
        }
      });
      break;
    default:
      console.error(`Command '${command}' not supported.`);
  }
}

gitgod();
