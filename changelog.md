# Changelog

## v0.20.0

### Changes
- Allow signed out use within rate limits

## v0.19.1

### Changes
- Handle 429 Too Many Requests error from Reddit
### Fixes
- Seen posts now logged from feed scrolling

## v0.19.0
### New
- Reddit API use is now protected behind troddit+ authentication. This is in response to recent pricing changes made by Reddit. 
  - Private instances are unaffected unless opted in. 
- API use is now anonymously logged

## v0.18.0
### New
- Troddit will now remember and resume your position in recent feeds
- View duplicate discussions from thread overflow menu
- Hold to preview media on small devices in media card mode
  
### Fixes
- Dual posts now display both media and selftext body everywhere except media and compact cards
- Local custom feeds will no longer be reset

### Changes
- The whole post body now scrolls when a thread is open
- Appearance and behavior of selftexts changed
- General scrolling performance was improved

## v0.17.5
### New
- Now you can set the global default comment sort for threads
  - Find the "Default Comment Sort" option in the settings page.
### Fixes
- Fix sometimes unordered image galleries
- Fix some issues when fetching user posts.

## v0.17.4

### New
- New settings: 
  - Prefer Side-by-Side and Disable Side-by-Side toggles in the Layout section
    - To prefer placing comments to to the side or disabling automatic side placement. 
  - Auto collapse comments in Comments section
    - Automatically collapse recently collapsed, controversial, or hidden comments as displayed on Reddit. Enabled by default.

### Changes
- The navigation bar no longer automatically hides on scrolling
  - This behavior can be re-enabled with the 'Hide NavBar' toggle in the Layout section of the settings page.
- Search location changed on mobile
- Minor style changes
### Fixes
- Fix miscellaneous issues with video playback


## v0.17.3

### Changes
- Changes to video player inner-workings
- Minor video player visual updates on mobile
- Now if a video cannot autoplay un-muted (for example, because of browser security restrictions) it will try to autoplay muted. 

### Fixes
- Reddit video audio now works on iOS and other browsers previously unsupported
- Video autoplay now works on iOS

## v0.17.2

### Changes
- Galleries wrap around and images will fill available space

### Fixes
- Fix some missing comment links
- Fix videos in crossposts
- Show initial feed loading state

## v0.17.1

### Changes
- Search will now default to subreddit search when possible
- Minor style changes to reader mode and comment votes
### Fixes
- Prevent links to deleted users

## v0.17.0

### New

- You can now open media to fill the window (full media mode). Self posts will fill the window in a reader view.
- You can now autoplay posts in full media mode.
- You can now vertically swipe between posts in full media mode.
- There is a new button when a self post is opened to vertically expand text.
- There is now an option to uniformly size cards when using media cards.

### Changes

- Clicking an image or thumbnail in a card will open the post in full media mode.
- When a post is open, the expand button will now open the media in full media mode.

### Fixes

- Window size changes will no longer close open posts.
  - So you can now go full screen on videos when a post is open.

## v0.16.0

### New

- You can now edit and delete your comments from troddit
  - This requires new Reddit permissions so you may need to re-login with your Reddit account
- You can now copy comment permalinks to share
- You can now collapse comments only when the comment ribbon is pressed. Find the "Ribbon Collapse" toggle in the Comments section of the Settings page. By default pressing anywhere on the comment will collapse the comment

### Changes

- Volume will now be saved between sessions
- Image galleries were improved including swipe action
- Swipe to close threads has been disabled
- Default column counts have changed

### Fixes

- Miscellaneous fixes to commenting

## v0.15.6

### Changes

- When logged in, your subreddits, follows, and custom feeds will be cached locally and synced with Reddit every 24 hours or when the refresh button is clicked. The refresh button is located at the bottom of the subreddits pane or subreddits page. Previously this information was fetched every time troddit was opened causing high network usage for power users.
  - Logging out of troddit will clear the local cache.

## v0.15.5

### New

- Subscribe to subreddits or follow users directly from the post card overflow menu
- Scroll position is remembered and restored when using classic rows card style

### Changes

- Menus are now more mobile friendly

### Fixes

- Miscellaneous fixes

## v0.15.4

### Changes

- Image previews for 'link' type posts are now shown as large thumbnails in Original and Compact Cards.
  - This behavior can be reverted with the toggle labeled "Link Thumbnails" in the Appearance section of the settings page.
- Other slight UI changes including a slimmer nav bar.

## v0.15.3

### New

- New filter to remove 'seen' posts from the feed.
  - Posts are considered seen when they are scrolled off the page
  - Option to disable logging seen posts in settings
- New buttons to clear seen and read history in settings

### Changes

- General performance improvements
- Comment score now shown when collapsed
- Vote options hidden until opened on mobile devices

## v0.15.2

### New

- Support for favorite subreddits:
  - Click the star next to subscribed subreddits and followed users in the dropdown pane to pin them to the top. Works with and without a Reddit login.

### Changes

- Rows view is now more mobile friendly. On small devices the thumbnail has moved to the right and expanding media button is no longer available.
- Post navigation buttons have been added to threads on small devices.

## v0.15.1

## Changes

- Posts are now automatically marked as read when the thread is closed instead of when it is opened
- Improved new comment detection so new comments are highlighted between sessions
- Votes on comments now update quickly without triggering a refetch of comment scores

## v0.15.0

### New

- Auto-updating feeds:
  - Feeds now automatically update posts periodically with the latest score, comment count, and awards.
  - A prompt will appear to update the feed if any new posts are found
  - New options to configure this behavior in the settings page:
    - Monitor Feed: To toggle checking for feed updates.
    - Refresh Intervals: To set the number of seconds between checking for updates. Different intervals for "new" and "rising" compared to other sorts can be set.
    - Ask To Update: To update the feed with new posts immediately without a prompt this can be disabled.
    - Check on Focus: Control whether the feed is checked when returning to troddit from another window
- Auto-updating threads:
  - Similar to feeds, comment threads will be checked for new comments when a post is re-opened or the window re-focused. Any new comments will be highlighted and marked "new".
  - This behavior can be disabled with the "Monitor Comments" setting.
- 'New Comment' counts:
  - A count for new comments since the thread was last read will now appear next to the comment count

### Changes

- Cached feeds and comments:
  - Now feeds and comments will load immediately if they have been previously loaded.
  - Any recently collapsed comments or more loaded comments will remain collapsed or loaded
- Comment scores will now be hidden if the subreddit hides scores sometime after posting.
- Comments will now appear collapsed if they're collapsed on Reddit. If available, the collapse reason is shown.
- Consistent video volumes: changing a video's volume will now update other videos as well.
- Previously any changed filters would apply to new pages without pressing "Apply". Now the Apply button must be pressed to apply filters if using the filters modal.
- Switching to portrait mode in a thread will now auto expand and align any text in self posts to the top
- Miscellaneous style changes

## v0.14.2

### New

- Added Dracula theme

### Fixes

- For those self hosting, Reddit links will now be replaced with the current hostname instead of troddit.com.

## v0.14.1

### Fixes

- Fix miscellaneous comment rendering issues including showing gifs in comments
- Fix Docker build

## v0.14.0

### New

- Added themes! Find them in the new appearance section of the settings page:
  - Abyss, Black, Nord, Ocean, and Palenight
- In-line image viewing: open linked images directly in comments and posts.

### Changes

- Feeds (multi-reddits) now show the feed banner instead of the first subreddit banner.
- Some colors have changed to support more themes

### Fixes

- Direct comment links now work
- Deeply nested comments were previously hidden. There is now a link to open them.
- You can now load more comments beyond the first page. This requires a log in.
- Feed icons are now shown.

## v0.13.3

### New

- There's now a subreddit to discuss troddit: <a href="/r/TrodditForReddit">r/TrodditForReddit</a>
- Read post titles and text will be dimmed in cards
  - New option to disable this in settings
  - New option to disable automatically marking a post as read when its thread is opened
- Options for handling embedded media:
  - Disable embedded: useful if you don't want cookies from external sites such as YouTube.
  - Prefer embedded: will prefer embedded videos instead of native video. Useful if native videos don't include audio from the external source.
  - Embedded everywhere: Will allow embedded media everywhere including multi-column cards. By default embedded media will only appear in post threads or in single column mode. Enabling this may reduce performance.
- Button to switch between embedded or native media. Will appear when hovered on media with this option.
- Clicking on the 'comments' buttons on a card will jump to the comments when the thread is loaded

### Changes

- Links in post text will automatically open in a new tab

### Fixes

- Read post state is now shown properly when automatically marked as read
- When logged in the initial posts were sometimes not from your front page. This was fixed.
- User page will no longer jump to top when navigating back from posts
- Command click now works for Mac to open posts in a new window

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
- Audio will automatically unmute when a video scrolls into view in single column mode with audio toggle enabled
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

- Miscellaneous fixes

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
- Added official Docker image

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

- Support to navigate posts with arrows, both onscreen and keyboard
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

- Added support for subscribing and unsubscribing to subreddits either locally or with your Reddit account
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
