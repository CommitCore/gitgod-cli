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
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
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
  await gitCommit(message);
  console.log("Pushing changes to the repo...");
  await runCommand("git push");
};

const gitPull = async () => {
  console.log("Pulling changes from repo...");
  await runCommand("git pull -u origin main");
};

const gitCommit = async (message) => {
  await runCommand(`git commit -m "${message}"`);
};

const setGitUsingClone = async (error) => {
  if (error && error.message && find(error.message, "not a git repository")) {
    const github = await askQuestion(
      "Enter Github Repository URL/HTTPS/SSH :-",
    );
    const ssh = await convertToSsh(github);

    console.log("Git Initializing...");
    console.log("Fetching repo data..");

    await runCommand("git init");
    await runCommand("git add .");

    await gitCommit("commit by gitgod");
    await runCommand(`git remote add origin ${ssh}`);
    await runCommand("git fetch");
    await runCommand("git branch -M main");

    console.log("Setting up a git remote...");
    await runCommand("git branch --set-upstream-to=origin/main main");
    await runCommand("git config pull.rebase false");
    await runCommand("git pull --allow-unrelated-histories --no-edit");

    console.log("Git Pulling repo file");
    await gitPull();
    await runCommand("git push -u origin main");
    console.log("Git repository synced Successfully.");
  }
};

const gitSync = async () => {
  const message = await askQuestion("Enter commit message :-");
  console.log("git syncing..");

  await runCommand("git init");
  await runCommand("git add .");
  await gitCommit(message);

  await runCommand("git branch --set-upstream-to=origin/main main");

  await gitPull();
  await runCommand("git push -u origin main");
  console.log("Git Synced successfully.");
};

const main = async () => {
  let command = "git status";
  let { error, stdout, stderr } = await runCommand(command);

  if (error) {
    await setGitUsingClone(error);
  } else {
    await gitSync();
  }

  if (stderr) {
  }

  if (stdout) {
  }
};

main();
