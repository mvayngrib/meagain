<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [meagain](#meagain)
  - [Why?](#why)
  - [What?](#what)
    - [Event Stream Sample](#event-stream-sample)
    - [The steps involved](#the-steps-involved)
  - [Install](#install)
  - [Usage](#usage)
    - [Command Line](#command-line)
    - [Use as a Module](#use-as-a-module)
    - [Todo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# meagain

track activity on your computer, optionally save to your AWS account (an S3 bucket you control)

## Why?

To analyze your life, you need data. You don't have it, and if you do, you don't own it. Apps like RescueTime store your data in their cloud. Apps like Timing store data locally...but what if they don't really? I mean I'm sure they do...but what if they don't?

## What?

currently tracked: 
  - foreground application 
  - system idle time. 

### Event Stream Sample

```js
[
  // ...
  {
    "app": "Sublime Text",
    "time": 1533746158318,
    "duration": 1040
  },
  {
    "app": "Google Chrome",
    "type": "browser",
    "activeTab": {
      "title": "Inbox (1,431) - mvayngrib@gmail.com",
      "url": "https://mail.google.com/mail/u/0/#inbox"
    },
    "time": 1533746159358,
    "duration": 980
  },
  {
    "app": "WhatsApp",
    "time": 1533746160338,
    "duration": 5048
  },
  {
    "app": "AdobeReader",
    "time": 1533746165386,
    "duration": 1028
  },
  // ...
]
```

### The steps involved

1. track foreground application / idle time
1. store locally to an append-only log (`~/.meagain/log.db`)
1. periodically consume the log and sync to S3
1. TODO: analyze

## Install

```sh
npm i -g meagain
```

## Usage

### Command Line

```sh
# configure your storage options
meagain configure

# start tracking your activity
meagain start
```

### Use as a Module

See [lib/cli/track.js](./lib/cli/track.js) for an example of how to set up tracking

### Todo

- implement web app (ignore the mess in `app/` for now)
- support data queries
  - get activity breakdown during a time period (today, this month)
  - search content of visited browser pages (later)
- improve run-as-a-service mode: 
  - enable start on system start
