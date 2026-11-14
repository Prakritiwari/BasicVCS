# basicvcs-cli

Command line client for BasicVCS. Commits are pushed directly to S3 through
short-lived presigned URLs issued by the API; no AWS credentials are stored on
the user's machine.

## Install

```bash
npm install -g basicvcs-cli
```

## Configure and sign in

```bash
basicvcs config set api https://your-api.example.com
basicvcs login
```

The token is stored in `~/.basicvcs/config.json` and lasts 30 days.

## Link a local folder

Create the repository in the BasicVCS web app, then:

```bash
cd my-project
basicvcs link https://your-app.example.com/repo/<repoId>
```

This writes `.hidGit/config.json` with the repository id and API URL.

## Commands

```bash
basicvcs init
basicvcs add index.html
basicvcs commit "first commit"
basicvcs push
basicvcs pull
basicvcs revert <commitID>
basicvcs logout
```

Useful config commands:

```bash
basicvcs config show
basicvcs config get api
basicvcs config set api http://localhost:3000
```

All file data goes directly between the CLI and S3. The API only signs URLs and
reads commit metadata.
