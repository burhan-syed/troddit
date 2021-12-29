# Troddit 
### _A web client for Reddit_

Built using NextJS and Typescript. Styled with TailwindCSS. 

## Features

- Secure logins with Reddit to enable voting, commenting, following/unfollowing subreddits, viewing your followed subreddits, and access to your personal front page. 
- 'Offline mode' to follow subreddits locally without login and generate a personal front page.
- Search for subreddits with auto-complete. 
- View posts in single column, custom multi-column with masonry layout, or a simple row mode. All with infinite-scrolling. 
- Choose your card style: Original for full post text in card, Compact for titles and media (images and video) only, or Media to hide all text and card padding. 
- Gallery view: Click on a post and navigate with on screen buttons or your arrow keys through the feed on desktop. Shows the post content as well as its comments from Reddit. Smart portrait mode to automatically arrange vertical photos and videos beside comments. 
- Hover mouse over Reddit videos to play. Enable to Autoplay option to play videos automatically when they enter the viewport. Enabling the Audio option will also play sound on the video on mouse hover if it is available. 
- Responsive desktop and mobile layouts.  
- PWA to download to your computer or phone. 
- Docker support


## Developing

Clone the repo and install all packages with npm or yarn. Then to run development server: 

```sh
npm run dev
# or
yarn run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Environment Variables
To use login functionality the following environment variables need to be defined in a .env.local file placed in the root directory: 

CLIENT_ID=\<ID of your Reddit app>\
CLIENT_SECRET=\<Secret from your Reddit app>\
REDDIT_REDIRECT=http://localhost:3000/api/auth/callback/reddit  
NEXTAUTH_SECRET=\<See [https://next-auth.js.org/configuration/options#secret](https://next-auth.js.org/configuration/options#secret)>\
NEXTAUTH_URL=http://localhost:3000

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

```sh
git clone https://github.com/burhan-syed/troddit
cd troddit
docker build . -t troddit
```

This will create the troddit image and pull in the necessary dependencies. To run:

```sh
docker run -p 3000:3000 troddit
```

