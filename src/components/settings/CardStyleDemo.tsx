import React, { useState, useEffect } from "react";
import { useMainContext } from "../../MainContext";

const CardStyleDemo = () => {
  const context: any = useMainContext();

  const [cardStyle, setCardStyle] = useState(
    context.cardStyle === "card2"
      ? "Compact"
      : context.cardStyle === "card1" && context.mediaOnly
      ? "Media"
      : context.cardStyle === "row1"
      ? "Rows"
      : "Default"
  );

  useEffect(() => {
    setCardStyle(
      context.cardStyle === "card2"
        ? "Compact"
        : context.cardStyle === "card1" && context.mediaOnly
        ? "Media"
        : context.cardStyle === "row1"
        ? "Rows"
        : "Original"
    );
  }, [context.cardStyle, context.mediaOnly]);

  return (
    <div>
      Selected:{" "}
      {cardStyle == "Compact"
        ? "Compact cards. Allows images and videos to fill the card fully with title and other information placed at the bottom. Text from posts are hidden. "
        : cardStyle == "Media"
        ? "Media cards. Only images and video are shown with title and other information available on hover."
        : cardStyle == "Rows"
        ? "Classic Rows. Thumbnails with expandable media rendered as a list."
        : "Original cards. Displays all available information for each post in card form."}
    </div>
  );
};

export default CardStyleDemo;
