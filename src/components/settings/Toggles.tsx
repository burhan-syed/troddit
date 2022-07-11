// import {Switch} from '@headlessui/react'
import Switch from "react-switch";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { BiComment, BiDetail, BiMoon, BiSun } from "react-icons/bi";
import { CgArrowsShrinkH, CgArrowsMergeAltH } from "react-icons/cg";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import {
  BsX,
  BsCheck,
  BsPlay,
  BsStop,
  BsVolumeMute,
  BsVolumeUp,
} from "react-icons/bs";

import { useMainContext } from "../../MainContext";
import ThemeSelector from "./ThemeSelector";

interface ToggleProps  {
  setting:
    | "theme"
    | "nsfw"
    | "autoplay"
    | "hoverplay"
    | "audioOnHover"
    | "wideUI"
    | "syncWideUI"
    | "postWideUI"
    | "collapseChildrenOnly"
    | "defaultCollapseChildren"
    | "showUserIcons"
    | "showAwardings"
    | "showFlairs"
    | "showUserFlairs"
    | "expandedSubPane"
    | "infiniteLoading"
    | "dimRead"
    | "autoRead"
    | "disableEmbeds"
    | "preferEmbeds"
    | "embedsEverywhere"
    | "userPostType"
    | "autoRefreshFeed"
    | "autoRefreshComments"
    | "askToUpdateFeed"
    | "refreshOnFocus";

  label?: string;
  externalStyles?: string;
  withSubtext?: boolean;
  subtext?: string;
};

const Toggles = ({
  setting,
  label,
  externalStyles,
  withSubtext = false,
  subtext,
}: ToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const context: any = useMainContext();

  const [onHandleColor, setOnHandleColor] = useState<string>();
  const [offHandleColor, setOffHandleColor] = useState<string>();
  const [onColor, setOnColor] = useState<string>();
  const [offColor, setOffColor] = useState<string>();

  const [checkedIcon, setCheckedIcon] = useState(<BsCheck />);
  const [uncheckedIcon, setUncheckedIcon] = useState(<BsX />);
  const [switchLabel, setSwitchLabel] = useState(label);
  const [title, setTitle] = useState("");
  const [switchSubtext, setSwitchSubtext] = useState(subtext);
  const disabled =
    (setting == "postWideUI" && context.syncWideUI == true) ||
    (setting == "collapseChildrenOnly" &&
      context.defaultCollapseChildren === true) ||
    (setting == "theme" &&
      resolvedTheme !== "dark" &&
      resolvedTheme !== "light");
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [updateTheme, setUpdateTheme] = useState(0);
  useEffect(() => {
    setUpdateTheme((t) => t + 1);
  }, [resolvedTheme]);
  useEffect(() => {
    let toggleColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--toggleColor")
      .trim();
    let toggleHandleColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--toggleHandleColor")
      .trim();

    setOnHandleColor(() =>
      setting == "nsfw"
        ? resolvedTheme === "dark"
          ? "#991B1B"
          : "#EF4444"
        : toggleHandleColor
    );
    setOffHandleColor(() =>
      setting == "theme"
        ? "#F59E0B"
        : setting == "nsfw"
        ? "#4ADE80"
        : toggleHandleColor
    );
    setOnColor(() => toggleColor);
    setOffColor(() =>
      setting == "theme"
        ? "#EA580C"
        : setting == "nsfw"
        ? "#059669"
        : toggleColor
    );
  }, [updateTheme]);

  useEffect(() => {
    switch (setting) {
      case "theme":
        !label && setSwitchLabel("Theme");
        !subtext && setSwitchSubtext("Switch between dark and light theme");
        setCheckedIcon(<BiMoon />);
        setUncheckedIcon(<BiSun />);
        setIsChecked(resolvedTheme !== "light");
        break;
      case "nsfw":
        !label && setSwitchLabel("NSFW");
        !subtext &&
          setSwitchSubtext(
            context.nsfw ? "18+ posts shown as normal" : "18+ posts are blurred"
          );
        setTitle("blur 18+ posts");
        setCheckedIcon(<VscEye />);
        setUncheckedIcon(<VscEyeClosed />);
        break;
      case "autoplay":
        !label && setSwitchLabel("Autoplay");
        !subtext &&
          setSwitchSubtext(
            "Autoplay videos and gifs when they enter into view"
          );
        setTitle("autoplay videos & gifs");
        setCheckedIcon(<BsPlay />);
        setUncheckedIcon(<BsStop />);
        break;
      case "hoverplay":
        !label && setSwitchLabel("Hoverplay");
        !subtext && setSwitchSubtext("Play videos and gifs on mouse hover");
        setTitle("play videos & gifs on hover");
        setCheckedIcon(<BsPlay />);
        setUncheckedIcon(<BsStop />);
        break;
      case "audioOnHover":
        !label && setSwitchLabel("Audio");
        !subtext &&
          setSwitchSubtext(
            "Auto unmute audio on mouse hover or post open. Will also unmute audio when a post scrolls into view in single column mode."
          );
        setTitle("unmute on post open or video hover");
        setCheckedIcon(<BsVolumeUp />);
        setUncheckedIcon(<BsVolumeMute />);
        break;
      case "wideUI":
        setIsChecked(context.saveWideUI === true);
        !label && setSwitchLabel("Wide UI");
        !subtext &&
          setSwitchSubtext(
            "Enable or disable wide UI in single column mode. Also sets post width if sync wide UI is enabled"
          );
        setTitle("toggle wide ui in single column mode");
        setCheckedIcon(<CgArrowsShrinkH />);
        setUncheckedIcon(<CgArrowsMergeAltH />);
        break;
      case "syncWideUI":
        !label && setSwitchLabel("Sync Width");
        !subtext &&
          setSwitchSubtext(
            "Syncs Wide UI changes with Post Width. If Post Width is narrow posts will not automatically display comments to the side."
          );
        break;
      case "postWideUI":
        !label && setSwitchLabel("Post Width");
        !subtext &&
          setSwitchSubtext(
            `${
              context.syncWideUI
                ? "'Sync Width' must be disabled to toggle this. "
                : "Sets post width. Narrow or wide."
            }`
          );
        setCheckedIcon(<CgArrowsShrinkH />);
        setUncheckedIcon(<CgArrowsMergeAltH />);
        break;
      case "collapseChildrenOnly":
        !label && setSwitchLabel("Collapse Mode");
        !subtext &&
          setSwitchSubtext("Enable to only collapse children comments");
        break;
      case "defaultCollapseChildren":
        !label && setSwitchLabel("Collapse Children");
        !subtext &&
          setSwitchSubtext(
            "Enable to collapse all children comments initially. Requires alternate collapse mode to be enabled."
          );
        break;
      case "showUserIcons":
        !label && setSwitchLabel("User Icons");
        !subtext && setSwitchSubtext("Show user icons in comments");
        break;
      case "showAwardings":
        !label && setSwitchLabel("Gildings");
        !subtext && setSwitchSubtext("Show gildings everywhere");
        break;
      case "showFlairs":
        !label && setSwitchLabel("Post Flairs");
        !subtext && setSwitchSubtext("Show post flairs");
        break;
      case "showUserFlairs":
        !label && setSwitchLabel("User Flairs");
        !subtext && setSwitchSubtext("Show user flairs");
        break;
      case "expandedSubPane":
        !label && setSwitchLabel("Expanded Pane");
        !subtext &&
          setSwitchSubtext(
            "Automatically shows the subreddit dropdown pane as expanded instead of collapsed"
          );
        break;
      case "infiniteLoading":
        !label && setSwitchLabel("Infinite Loading");
        !subtext && setSwitchSubtext("Disable to load new feed pages manually");
        break;
      case "dimRead":
        !label && setSwitchLabel("Dim Read");
        !subtext && setSwitchSubtext("Dim read post titles and text in cards");
        break;
      case "autoRead":
        !label && setSwitchLabel("Auto Read");
        !subtext &&
          setSwitchSubtext(
            "Automatically mark posts as read when their thread is opened"
          );
        break;
      case "disableEmbeds":
        !label && setSwitchLabel("Disable Embeds");
        !subtext &&
          setSwitchSubtext(
            "Will not load any embeds unless you explicitly switch to embed"
          );
        break;
      case "preferEmbeds":
        !label && setSwitchLabel("Prefer Embeds");
        !subtext &&
          setSwitchSubtext(
            "Prefer embeds instead of native video. Native video options may not work (autoplay, hoverplay, audio, etc.)"
          );
        break;
      case "embedsEverywhere":
        !label && setSwitchLabel("Embed Everywhere");
        !subtext &&
          setSwitchSubtext(
            "By default embeds will only show in single column view or in a post thread. Enable this to show embeds in multi-column mode. Note, this is disabled by default for better performance."
          );
        break;
      case "userPostType":
        setIsChecked(context?.[setting] === "links");
        setCheckedIcon(<BiDetail />);
        setUncheckedIcon(<BiComment />);
        !label && setSwitchLabel("Post Type");
        !subtext &&
          setSwitchSubtext("Switch between showing comments or posts");
        break;
      case "autoRefreshFeed":
        !label && setSwitchLabel("Monitor Feed");
        !subtext &&
          setSwitchSubtext(
            "Enable to automatically check for new posts periodically"
          );
        break;
      case "autoRefreshComments":
        !label && setSwitchLabel("Monitor Comments");
        !subtext &&
          setSwitchSubtext(
            "Enable to check for new comments when a thread is opened or window refocused"
          );
        break;
      case "askToUpdateFeed":
        !label && setSwitchLabel("Ask to Update");
        !subtext &&
          setSwitchSubtext(
            "Enable to be prompted before updating feed with new posts. If disabled feed will update automatically with no prompt. "
          );
        break;
      case "refreshOnFocus":
        !label && setSwitchLabel("Check on Focus");
        !subtext &&
          setSwitchSubtext(
            "Enable to check for new posts when the window is refocused"
          );
        break;
      default:
        break;
    }
    if (
      setting !== "theme" &&
      setting !== "wideUI" &&
      setting !== "userPostType"
    ) {
      setIsChecked(context[setting] === true);
    }
  }, [resolvedTheme, context?.[setting], context.syncWideUI]);

  const handleChange = () => {
    switch (setting) {
      case "theme":
        setTheme(
          resolvedTheme === "dark"
            ? "light"
            : resolvedTheme === "light" && "dark"
        );
        break;
      case "nsfw":
        context.toggleNSFW();
        break;
      case "autoplay":
        context.toggleAutoplay();
        break;
      case "hoverplay":
        context.toggleHoverPlay();
        break;
      case "audioOnHover":
        context.toggleAudioOnHover();
        break;
      case "wideUI":
        context.toggleWideUI();
        break;
      case "syncWideUI":
        context.toggleSyncWideUI();
        break;
      case "postWideUI":
        context.togglePostWideUI();
        break;
      case "collapseChildrenOnly":
        context.toggleCollapseChildrenOnly();
        break;
      case "defaultCollapseChildren":
        context.toggleDefaultCollapseChildren();
        break;
      case "showUserIcons":
        context.toggleShowUserIcons();
        break;
      case "showAwardings":
        context.toggleShowAwardings();
        break;
      case "showFlairs":
        context.toggleShowFlairs();
        break;
      case "showUserFlairs":
        context.toggleShowUserFlairs();
        break;
      case "expandedSubPane":
        context.toggleExpandedSubPane();
        break;
      case "infiniteLoading":
        context.toggleInfiniteLoading();
        break;
      case "dimRead":
        context.toggleDimRead();
        break;
      case "autoRead":
        context.toggleAutoRead();
        break;
      case "disableEmbeds":
        context.toggleDisableEmbeds();
        break;
      case "preferEmbeds":
        context.togglePreferEmbeds();
        break;
      case "embedsEverywhere":
        context.toggleEmbedsEverywhere();
        break;
      case "userPostType":
        context.toggleUserPostType();
        break;
      case "autoRefreshFeed":
        context.setAutoRefreshFeed((f) => !f);
        break;
      case "askToUpdateFeed":
        context.setAskToUpdateFeed((f) => !f);
        break;
      case "refreshOnFocus":
        context.setRefreshOnFocus((f) => !f);
        break;
      case "autoRefreshComments":
        context.setAutoRefreshComments((f) => !f);
        break;
      default:
        break;
    }
  };

  if (!mounted) return <></>;

  // if (disabled && setting == "theme"){
  //   return (<div className="flex items-center flex-grow gap-1"><label>Theme</label><ThemeSelector/></div>)
  // }

  return (
    <label
      className={
        "flex flex-row items-center justify-between " +
        externalStyles +
        (disabled ? " opacity-50 pointer-events-none" : " ")
      }
      title={title}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="flex flex-col gap-0.5">
        <span>{switchLabel}</span>
        {(withSubtext || subtext) && (
          <span className="mr-2 text-xs opacity-70">{switchSubtext}</span>
        )}
      </span>

      <Switch
        disabled={disabled}
        onChange={() => {
          !disabled && handleChange();
        }}
        checked={isChecked}
        checkedIcon={
          <div className="flex items-center justify-center h-full text-lg">
            {checkedIcon}
          </div>
        }
        uncheckedIcon={
          <div
            className={
              "flex items-center justify-center h-full text-lg" +
              (setting == "theme" || setting == "nsfw" ? " text-white " : "")
            }
          >
            {uncheckedIcon}
          </div>
        }
        offColor={offColor}
        onColor={onColor}
        offHandleColor={offHandleColor}
        onHandleColor={onHandleColor}
      />
    </label>
  );
};

export default Toggles;
