# meagain

track activity on your computer, optionally save to your AWS account (an S3 bucket you control)

## Why?

To analyze your life, you need data. You don't have it, and if you do, you don't own it. Apps like RescueTime store your data in their cloud. Apps like Timing store data locally...but what if they don't really? I mean I'm sure they do...but what if they don't?

## What?

currently tracked: foreground application and system idle time

## Usage

### Command Line

```sh
npm i -g meagain
```

### Module

See [cli/track.js](./cli/track.js) for an example of how to set up tracking

### Todo

support data queries:
  - get activity breakdown during a time period (today, this month)
  - search content of visited browser pages (later)
  - handle process exit (e.g. machine shutdown). Run as service
  - maybe first write to local buffer, then sync to s3
