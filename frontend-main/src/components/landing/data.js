export const rotatingWords = ["your files", "commits", "pushes", "pulls", "reverts", "history"];

export const driftChips = [
  { text: "Which version was the good one?", className: "chip-a" },
  { text: "Did I push that?", className: "chip-b" },
  { text: "final_v2_FINAL.zip", className: "chip-c" },
  { text: "Overwrote it again.", className: "chip-d" },
  { text: "Can I go back?", className: "chip-e" },
  { text: "Where's that file?", className: "chip-f" },
];

export const commands = [
  {
    id: "init",
    number: "01",
    title: "Start a repository",
    description: "Creates the .hidGit folder and a place for commits.",
    command: "basicvcs init",
    output: ["Repository initialised!"],
  },
  {
    id: "add",
    number: "02",
    title: "Stage the files you care about",
    description: "Copies the file into the staging area. No guessing.",
    command: "basicvcs add hello.txt",
    output: ["File hello.txt added to the staging area!"],
  },
  {
    id: "commit",
    number: "03",
    title: "Save a snapshot",
    description: "Every commit gets an id, a message and a timestamp.",
    command: 'basicvcs commit "first commit"',
    output: ["Commit 7f3a9c1e-3b4d-4c9a-9f2e-1d8c6a5b4e3f created with message: first commit"],
  },
  {
    id: "push",
    number: "04",
    title: "Send every commit to S3",
    description: "Your bucket becomes the remote. No server to babysit.",
    command: "basicvcs push",
    output: ["Pushed 2 files from 1 commit(s) to the API."],
  },
  {
    id: "pull",
    number: "05",
    title: "Get your history back anywhere",
    description: "New machine, same commits. Pull them from the bucket.",
    command: "basicvcs pull",
    output: ["Pulled 2 files into .hidGit/commits."],
  },
  {
    id: "revert",
    number: "06",
    title: "Return to any commit",
    description: "One command and you are standing where you were.",
    command: "basicvcs revert 7f3a9c1e",
    output: ["Reverted to commit 7f3a9c1e (1 files restored)."],
  },
];

export const includedGroups = [
  {
    label: "Setup",
    items: [
      { name: "Repositories", status: "live" },
      { name: "JWT auth", status: "live" },
    ],
  },
  {
    label: "Working",
    items: [
      { name: "S3 commits", status: "live" },
      { name: "Issues", status: "live" },
      { name: "Branches", status: "soon" },
      { name: "Diff viewer", status: "soon" },
    ],
  },
  {
    label: "Sync",
    items: [
      { name: "CLI push / pull", status: "live" },
      { name: "Web push / pull", status: "soon" },
    ],
  },
  {
    label: "Recovery",
    items: [{ name: "Revert to any commit", status: "live" }],
  },
  {
    label: "Community",
    items: [
      { name: "Starring", status: "soon" },
      { name: "Following", status: "soon" },
    ],
  },
];

export const roadmapLoops = [
  {
    number: "01",
    title: "Save a version",
    body: "init, add, commit. The core loop, working end to end.",
    status: "live",
  },
  {
    number: "02",
    title: "Send it away",
    body: "Push commits to your own S3 bucket and pull them back on any machine.",
    status: "live",
  },
  {
    number: "03",
    title: "Talk about it",
    body: "Open issues against a repository, close them when they're done.",
    status: "live",
  },
  {
    number: "04",
    title: "Work in parallel",
    body: "Branches and a diff viewer. Not started yet — no fake launch dates.",
    status: "soon",
  },
];

export const faqItems = [
  {
    question: "Where are my files stored?",
    answer:
      "Commits and files are pushed to your own AWS S3 bucket. Repository metadata, users and issues live in MongoDB. The browser never touches S3 directly — the CLI does the upload.",
  },
  {
    question: "How do I go back to an old version?",
    answer:
      "Run basicvcs revert <commitID>. It restores that snapshot. Nothing is deleted, so you can always move forward again.",
  },
  {
    question: "How is this different from Git?",
    answer:
      "Fewer commands, one remote (your bucket), and a codebase you can read in a weekend. Branches and diffs are not implemented yet, and it does not try to be Git.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Only for the dashboard, issues and repository metadata. The CLI runs on your machine. Pushing and pulling need your S3 credentials in the backend .env.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. It is your bucket and your database. Repositories can be public or private in the dashboard, and sign-in uses JWTs stored in localStorage.",
  },
];
