# Changelog

## v0.13.2
### New
- Option to disable infinite loading 
### Changes
- Changed appearance of hidden comments count. Hidden comments count now appears in standard comment collapse mode.
### Fixes
- Fixed an issue when loading more pages with saved posts and other user specific feeds

## v0.13.1
### New
- Post upvote ratio information now included on post page
### Changes
- Clicking the title on a post page will now open the source link instead of the Reddit post 
### Fixes
- Archived post voting and commenting is disabled
- Gfycat source videos will now contain audio when available

## v0.13.0
### New
- Added a settings menu with new options including: 
  - Post width: Set post width independently of feed width
  - Auto collapse child comments when a post is opened
  - Only collapse child comments instead of the whole comment
  - Show or hide user flairs, post flairs, user icons, and gildings
  - More to come... 
### Changes
- Wide UI option has moved from the hamburger menu to the settings menu
### Fixes
- Clicking a link in a comment no longer collapses the comment
- Revert a change that disabled gilding details on hover

## v0.12.4
### New
- Toast notifications now appear on version upgrade
### Changes
- Initial posts are now server side rendered. This should mean faster initial page loads. If you follow subreddits locally without logging in you may need to reload the site to sync up your home page.  

## v0.12.3
### New
- Added changelog 
### Changes
- Miscellaneous text style changes 
### Fixes
- Fix broken Reddit links
  
## v0.12.2
### Fixes
- Fix last page load issue
- Fix opening permalinks when logged in
- Fix pagination when sorting on front page
- Cleanup duplicate posts showing up in feed
- Improve performance when using touch in post comments

## v0.12.1
### Changes
- Revamp media cards
- Speed up initial settings load
- Switch to plaintext editor

## v0.12.0
### New
- Add subreddit and user filters
- Show user icons in comments
- Show subreddit icons in original post cards when browsing multi-subreddits such as front page, r/all, or custom feeds
### Changes
- All card styles are now rounded
- Videos autoplay better
- Audio auto unmutes when video scrolls into view in single column mode with audio toggle enabled
- Local storage changes
- Media better fills cards

## v0.11.1
### Changes
- Change toast timings
- Update dependencies for security
### Fixes
- Fix newlines in markdown
- Fix 'join all' toast  

## v0.11.0
### New
- Add multis to subreddits page
- Add more multi management tools
- Add toast for action confirmation
### Changes
- Change verbiage from 'multis' to 'feeds'

## v0.10.1
### Changes
- Miscellaneous style changes
- Cache sub information
### Fixes
- Properly display crossposts

## v0.10.0
### New
- Track read posts locally
- Filter read posts
- Hide post option
- Add overflow (hamburger) menu to posts
### Fixes
- Fix asynchronous loading issues

## v0.9.0
### New
- Add subreddits page
- Add user comments to user page feed
### Changes
- User page menu links
### Fixes
- Fix user follow issue

## v0.8.2
### Changes
- Dropdown pane supports keyboard navigation
### Fixes
- Don't convert Reddit poll links to troddit
- Responsive style fixes

## v0.8.1
### New
- Autoscroll comments when collapse if needed
### Changes
- Vote icons are now filled in when voted for better accessibility 
- Reroute /comments path
### Fixes
- Browse a user's multi and open posts with rerendering feed
- Persist wide UI toggle
- Fix order of images in galleries
- Hydrate theme to user flairs

## v0.8.0
### New
- Added search page
- Support for wiki pages
- Added save post button 
- Added keyboard shortcuts
- Dropdown pane search
### Changes
- Markdown now appears in comment and post text bodies
- Improve subreddit banner placeholder
- Wide UI toggles without forcing refresh

## v0.7.1
### New
- Added video controls
### Fixes
- Miscallaneous fixes
  
## v0.6.1
### New
- Show user banners
- Dropdown pane can be expanded
### Changes
- Twitter embeds now have a placeholder
- Gallery UI changes
- Video previews are now HD instead of thumbnails

## v0.6.0
### New
- You can now search by flair
- Added filter options and toggles
- Spoilers are now indicated and blurred
- Awards are now shown
- Option for narrow UI
- Added an error boundary
### Changes
- Miscellaneous style changes
### Fixes
- Gifs now animate (as videos)

## v0.5.1
### Changes
- Videos now default to lower resolution when appropriate
- Multi subreddits are sorted alphabetically
### Fixes
- Reduce unnecessary network usage
- Fixes when navigating in multis
- Votes are now consistent between post modals and post cards
- Directly opening a post now shows a loading indicator instead of nothing

## v0.5.0
### New
- Added subreddit banners
- Added subreddit sidebar info in modal
- Added subreddit pills when browsing multis
- Added support to manage multis both locally or with Reddit account
  - Add or remove subreddits to multis
  - Delete multis
  - Create multis
- Added official docker image
### Fixes
- Fixes to user feeds

## v0.4.2
### Changes
- Improve post colors with hover color change effects
- Improve swipe gestures on mobile
- Improve comments on mobile

## v0.4.1
### Changes
- Previous votes now shown between page reload
- Stickied posts now indicated with green title
- Single column improvements
- Color style changes with PWA
- preferring /u instead of /user for user routes
### Fixes
- Search autofill async issues

## v0.4.0
### New 
- Support to nagivate posts with arrows, both onscreen and keyboard
- Added new 'portrait' post mode view with media and comments side-by-side. Automatically selected for portrait media.
- Now downloadable as PWA

## v0.3.1
### New
- Display post flairs
- Support twitter embeds
### Changes
- Routes are better handled with fewer feed refreshes
- Login now takes you directly to Reddit
### Fixes
- Miscellaneous fixes to multis and dropdown pane

## v0.3.0
### New
- Added support for subbing and unsubbing to subreddits either locally or with your Reddit account
- Added ability to reply with comments
- Added new post card styles
  - Classic Row: A classic rows view with thumbnail and expandable media
  - Compact Card: A minimal version of the original card without padding and self post text. 
- Added support to change post column count
- Added support for limited subreddit search without login
- Added ability to play video on hover

### Changes
- Posts are now virtualized (windowed) to improve performance
- Reddit videos now play audio when available
- Usernames in comments now link to profiles
- Hidden NSFW images are now blurred

## v0.2.1
### New
- Adding sort options for comments
- Added about page
### Changes
- Improve mobile sidebar
### Fixes
- Fix video autoplay and miscellaneous media display issues

## v0.2.0
### New 
- Added post comments
- Added ability to vote on posts and comments
- Added side navbar for mobile
- Added support for embedded iframes
### Changes
- Tall images and videos are displayed better
- Improved miscellaneous styles

## v0.1.1
### New
- Added support for multi-reddits (feeds)
- Added menu for followed subreddits
- Added theme toggles
- Added toggle to hide NSFW posts
### Changes
- Updated navbar, post card, and search styles
- Improved image galleries
### Fixes
- Reddit refresh token persists properly

## v0.1.0
### New
- Added Reddit authenticated logins
- Added Reddit search with autocomplete
- Added image gallery support
- Added support for additional routes including post sorting
### Changes
- Improved miscellaneous styles

## v0.0.1 
### New
- Initial release with masonry view
