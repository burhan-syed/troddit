# Troddit

### _An alternative front end web client for Reddit_

Live at [troddit.com](https://www.troddit.com)

## Screenshots

### Flexible column viewing.

Shown browsing a multi-reddit. Subreddits pane and options menu open.
<img width="1725" alt="columns_options" src="https://user-images.githubusercontent.com/32972409/155919206-e7256397-b2a7-4718-bd17-ff1982b56d1a.png">

### Classic rows view

<img width="1725" alt="classicrows_light" src="https://user-images.githubusercontent.com/32972409/155919273-1f5ba3ef-5f4f-45ec-a12b-ea3e5847e24c.png">

#### with inline media expansion and custom reddit video player

<img width="1725" alt="lightmode_row_open" src="https://user-images.githubusercontent.com/32972409/155919303-ec87bc67-bd2b-4cb5-b2c1-21456bf509df.png">

### Open posts with comments to the side and use arrows for navigation

<img width="1725" alt="post_open" src="https://user-images.githubusercontent.com/32972409/155919310-0d57fdaa-03a0-47c0-be03-1c29da6e87ac.png">

### Search for subreddits, users, and posts.

Shown in single column mode with wide UI disabled. Sort options menu is open.
<img width="1724" alt="search_narrow" src="https://user-images.githubusercontent.com/32972409/155919321-7dd78a3b-5eac-4753-92f9-295d44447e17.png">

### Fully responsive, downloadable as PWA

<img width="377" alt="responsive_troddit" src="https://user-images.githubusercontent.com/32972409/155920807-d6be76a6-c5e6-4f2a-b899-4910d7ca3801.png">

## Features

- Secure logins with Reddit to enable voting, commenting, managing your subreddits and multireddits (aka feeds), and access to your personal front page.
- 'Offline mode' to follow subreddits and manage multis locally without login. Autogenerates a personal front page.
  - Visit your [subreddits multi](https://www.reddit.com/subreddits) and copy the multireddit link. Replace 'reddit' with 'troddit' in the URL and then use the 'Join All' option to quickly follow all subs locally.
- Search Reddit for posts or subreddits quickly with auto-complete.
- Filter posts by type (Images, Video/GIFs, Links, Self)
- View posts in single column, custom multi-column with a grid-masonry layout, or a simple row mode. All with infinite-scrolling.
- Choose your card style: Original for full post text in card, Compact to exclude post text, or Media to hide all text and card padding.
- Gallery view: Click on a post and navigate through the feed with on screen buttons or your arrow keys. Shows the post content as well as its comments from Reddit. Smart portrait mode to automatically arrange vertical photos and videos side by side with comments.
- Hover mouse over Reddit videos to play. Enable to Autoplay option to play videos automatically when entering the viewport. Enable the Audio option to play sound on hover as well.
- Responsive desktop and mobile layouts.
- PWA to download to your computer or phone.
- Docker support

## Developing

Clone the repo and install all packages with npm or yarn. Then to run development server:

```sh
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To contribute create a branch and submit a PR!

### Environment Variables

To use login functionality the following environment variables need to be defined in a .env.local file placed in the root directory:

```sh
CLIENT_ID=<ID of your Reddit app>
CLIENT_SECRET=<Secret from your Reddit app>
REDDIT_REDIRECT=<YOUR DOMAIN/api/auth/callback/reddit>
NEXTAUTH_SECRET=<See https://next-auth.js.org/configuration/options#secret>
NEXTAUTH_URL=http://localhost:3000
SIGNING_PRIVATE_KEY=<See https://next-auth.js.org/v3/warnings, Generate with $jose newkey -s 256 -t oct -a HS512>
```

To create a Reddit app visit [https://old.reddit.com/prefs/apps/](https://old.reddit.com/prefs/apps/).
The redirect uri should match the REDDIT_REDIRECT variable.

## Docker

### To Deploy the [Docker Image](https://hub.docker.com/r/bsyed/troddit)

```sh
docker pull bsyed/troddit
docker run -d --name troddit -p 3000:3000 bsyed/troddit
```

### To Build the Image Yourself

By default, the Docker will expose port 3000, so change this within the
Dockerfile if necessary. When ready, simply use the Dockerfile to
build the image.

Clone and navigate to the repository 

```sh
git clone https://github.com/burhan-syed/troddit
cd troddit
```

To build the image and run container

```sh
docker-compose up
```

Or to just build

```sh
docker build . -t troddit
```

This will create the troddit image and pull in the necessary dependencies. To run:

```sh
docker run -p 3000:3000 troddit
```

### Support

If you like the project feel free to share and leave a star. If you're feeling generous you can support me on Ko-fi.

<span align="center">[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K47IYH1)</span>
