# Changelog

## v0.12.3
### New
- Added changelog 
### Changes
- Miscellaneous text style changes including toned down header sizes and bolding
### Fixes
- Fewer unsupported reddit links convert to troddit  
  
## v0.12.2
### Fixes
- Fix last page load issue
- Fix direct post open when logged in
- Fix infinite scroll with front page sorts
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
- Show subreddit icons in original post cards when browsing multi-subsreddits such as front page, r/all, or custom feeds
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
### Fix
- Fix asynchronous loading issues

## v0.9.0
### New
- Add subreddits page
- Add user comments to user page feed
### Changes
- User page menu links
### Fix
- Fix user follow issue

## v0.8.2
### Changes
- Dropdown pane support keyboard navigation
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
- Gallery 

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
- Added support for subbing and unsubbing to subreddits both locally and with Reddit account
- Added ability to reply to post with comments
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