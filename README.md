# trackme

track your activity on OSX, optionally save to your AWS account (an S3 bucket you control)

## What's the point?

To analyze your life, you need data. You don't have it, and if you do, you don't own it. Apps like RescueTime store your data in their cloud. Apps like Timing store data locally...but what if they don't really?

## What does it track?

The foreground application and system idle time

## Usage

### Command Line

```sh
npm i -g trackme
```

### Module

See [cmd.js](./cmd.js)

### Todo

support data queries:
  - get activity breakdown during a time period (today, this month)
  - search content of visited browser pages (later)
  - handle process exit (e.g. machine shutdown). Run as service
  - maybe first write to local buffer, then sync to s3
