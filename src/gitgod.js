#!/usr/bin/env node
import { exec } from "child_process";
import inquirer from "inquirer";

const find = (str, matchStr) => {
  if (str.includes(matchStr)) {
    return true;
  } else {
    return false;
  }
};

const runCommand = (command) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

async function askQuestion(question) {
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "input",
      message: question,
    },
  ]);
  return answer.input;
}

function convertToSsh(url) {
  if (isSshUrl(url)) {
    return url;
  }

  const repoRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\.git)?$/;
  const match = url.match(repoRegex);
  if (match) {
    const owner = match[1];
    const repo = match[2];
    return `git@github.com:${owner}/${repo}`;
  }
  return url;
}

function isSshUrl(url) {
  const sshRegex = /^git@github\.com:/;
  return sshRegex.test(url);
}

const gitPush = async () => {
  const message = await askQuestion("Enter Commit Message :- ");
  await runCommand("git add .");
  await runCommand(`git commit -m ${message}`);
  console.log("Pushing changes to the repo...");
  await runCommand("git push");
};

const gitPull = async () => {
  console.log("Pulling changes from repo...");
  await runCommand("git pull");
};

const main = async () => {
  const command = "git status";
  const { error, stdout, stderr } = await runCommand(command);

  if (error) {
    if (find(error.message, "not a git repository")) {
      const github = await askQuestion(
        "Enter Github Repository URL/HTTPS/SSH :- ",
      );
      const ssh = await convertToSsh(github);

      console.log("Git Initializing...");
      await runCommand("git init");

      console.log("Setting up a git remote...");
      await runCommand(`git remote add origin ${ssh}`);

      console.log("Fetching repo data..");
      await runCommand("git fetch origin");
      await runCommand("git checkout -b main origin/main");

      console.log("Setting Default Values...");
      await runCommand("git branch --set-upstream-to=origin/main main");

      await gitPull();
      await gitPush();
    }
  }
  //console.log(`Git output: ${stdout}`);
  if (stderr) {
    //console.error(`Git error: ${stderr}`);
  }

  if (stdout) {
  }
};
main();
