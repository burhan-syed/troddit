import React, { Component, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw } from "draft-js";
import draftToMarkdown from "draftjs-to-markdown";
import { runMain } from "module";
import { useSession } from "../../node_modules/next-auth/client";
import { postComment } from "../RedditAPI";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaSuperscript,
  FaListUl,
  FaStrikethrough,
  FaListOl,
  FaHeading,
  FaLink,
  FaQuoteRight,
} from "react-icons/fa";
import { BsTypeH1 } from "react-icons/bs";

const Editor: any = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);
// const draftToMarkdown: any = dynamic(
//   () => import('draftjs-to-markdown'),//.then((mod) => mod.draftToMarkdown),
//   {ssr: false}
// )

const editor = {
  options: ["inline", "blockType", "list", "link"],
  inline: {
    inDropdown: false,
    className: "!min-h-full !bg-red-500 !m-0",
    component: undefined,
    dropdownClassName: undefined,
    options: ["bold", "italic", "strikethrough", "superscript"],
    // bold: { icon: FaBold, className: "text-black" },
    // italic: { icon: FaItalic, className: undefined },
    // underline: { icon: FaUnderline, className: "" },
    // strikethrough: { icon: FaStrikethrough, className: undefined },
    // superscript: { icon: FaSuperscript, className: undefined },
  },
  blockType: {
    inDropdown: false,
    options: ["H1", "Blockquote"],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  list: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ["unordered", "ordered"],
  },
  link: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    popupClassName: undefined,
    dropdownClassName: undefined,
    showOpenOptionOnHover: true,
    defaultTargetOption: "_self",
    options: ["link"],
  },
};

const CommentReply = ({ parent, getHtml }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [html, setHtml] = useState("");
  const [session] = useSession();
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const editorStateChange = async (editorState) => {
    setEditorState(editorState);
  };

  const submit = (e) => {
    e.preventDefault();
    const run = async () => {
      setLoading(true);
      const draftToMarkdown: any = (await import("draftjs-to-markdown"))
        .default;
      const rawContentState = await convertToRaw(
        editorState.getCurrentContent()
      );
      const markup = draftToMarkdown(rawContentState);
      if (!(markup?.length > 1)) {
        setErr(true);
        setLoading(false);
      } else {
        const res = await postComment(parent, markup);
        setLoading(false);
        if (res) {
          const draftToHtml: any = (await import("draftjs-to-html")).default;
          const html = draftToHtml(rawContentState);
          setHtml(html);
          getHtml(html);
          setErr(false);
          setEditorState(EditorState.createEmpty());
        } else {
          setErr(true);
        }
      }
    };
    session && run();
  };

  return (
    <div className="relative ">
      {session && (
        <>
          <div className="flex flex-row justify-between w-full select-none text-darkBorderHighlight">
            <h1>Commenting as {session.user.name}</h1>
            {err && (
              <h1 className="text-red-400 text-color dark:text-red-700">
                Something went wrong
              </h1>
            )}
          </div>
          <Editor
            toolbarClassName={
              "absolute bottom-2 !bg-green-500 !rounded-lg !p-0 w-full !m-0 flex flex-row items-center !border-none "
            }
            editorClassName={
              "flex flex-none bg-lightBG dark:bg-darkHighlight border border-lightBorder focus:border-lightBorderHighlight dark:border-darkBorder dark:focus:border-darkBorderHighlight rounded-lg px-4 !mx-0 pb-8"
            }
            editorState={editorState}
            toolbarHidden
            toolbar={editor}
            onEditorStateChange={editorStateChange}
          />
          <div className="absolute bottom-0 right-0 flex flex-row justify-end">
            <button
              onClick={(e) => !loading && submit(e)}
              className={
                "px-2 m-2 border-2 bg-white border-lightBorderHighlight rounded-lg focus:bg-lightBorderHighlight dark:bg-darkBG dark:border-darkBorderHighlight dark:focus:bg-darkBorderHighlight " +
                (loading && " text-lightBorder")
              }
            >
              Comment
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CommentReply;
