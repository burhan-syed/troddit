import React, { Component, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw } from "draft-js";
import { runMain } from "module";
import { useSession } from "../../node_modules/next-auth/react";
import { draftToMarkdown } from "markdown-draft-js"; // import { usePlausible } from "next-plausible";
import { useMainContext } from "../MainContext";
import { ImSpinner2 } from "react-icons/im";
import useMutate from "../hooks/useMutate";

const Editor: any = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

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

const CommentReply = ({
  parent,
  postName,
  getResponse,
  onCancel = (e) => {},
  initialValue = "",
  mode = "REPLY",
}: {
  parent: string;
  postName: String;
  getResponse: Function;
  onCancel?: Function;
  initialValue?: string;
  mode?: "REPLY" | "EDIT";
}) => {
  const maincontext: any = useMainContext();
  const { replyFocus, setReplyFocus } = maincontext;
  //const [editorState, setEditorState] = useState(EditorState.createEmpty());
  //const [html, setHtml] = useState("");
  const { data: session, status } = useSession();
  const [err, setErr] = useState(false);
  //const [loading, setLoading] = useState(false);
  const EditorRef = useRef<HTMLTextAreaElement>(null);

  const [textValue, setTextValue] = useState(() => initialValue);
  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };
  // const plausible = usePlausible();

  // const editorStateChange = async (editorState) => {
  //   setEditorState(editorState);
  // };

  const { postCommentMutation, editCommentMutation } = useMutate();

  const submit = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    //for use with WYSIWYG editor
    // const run = async () => {
    //   setLoading(true);
    //   let rawContentState = await convertToRaw(editorState.getCurrentContent());
    //   for (let i = 0; i < rawContentState?.blocks?.length ?? 0; i++) {
    //     if (rawContentState.blocks[i]?.text) {
    //       rawContentState.blocks[i].text = rawContentState.blocks[
    //         i
    //       ].text.replaceAll("\n", "  \n");
    //     }
    //   }
    //   const markup = draftToMarkdown(rawContentState, {
    //     styleItems: {},
    //   });
    //   if (!(markup?.length > 1)) {
    //     setErr(true);
    //     setLoading(false);
    //   } else {
    //     const res = await postComment(parent, markup);
    //     setLoading(false);
    //     if (res) {
    //       getResponse(res);
    //       setErr(false);
    //       // plausible("comment");
    //       setEditorState(EditorState.createEmpty());
    //     } else {
    //       setErr(true);
    //     }
    //   }
    // };
    //session && run();
    const submitComment = async () => {
      // setLoading(true);
      // const res = await postComment(parent, textValue);
      // setLoading(false);
      // if (res) {
      //   getResponse(res);
      //   setErr(false);
      //   setTextValue("");
      // } else {
      //   setErr(true);
      // }
      if (parent.substring(0, 3) === "t3_") {
        postCommentMutation.mutate({
          parent: parent,
          textValue: textValue,
          postName: postName,
        });
      } else {
        try {
          setErr(false);
          let res = await postCommentMutation.mutateAsync({
            parent: parent,
            textValue: textValue,
            postName: postName,
          });
          res && getResponse(res);
        } catch (err) {
          setErr(true);
        }
      }
    };
    const submitEditComment = async() => {
      let res = await editCommentMutation.mutateAsync({parent: parent, text: textValue});
      if(res?.body_html){
        getResponse(res); 
      }else{
        setErr(true); 
      }
    }
    session && mode === "REPLY" && submitComment();
    session && mode === "EDIT" && submitEditComment(); 
  };

  useEffect(() => {
    if (postCommentMutation.isSuccess) setTextValue("");
  }, [postCommentMutation.isSuccess]);

  useEffect(() => {
    EditorRef?.current?.focus();
  }, [EditorRef?.current]);

  useEffect(() => {
    return () => {
      setReplyFocus(false);
    };
  }, []);

  return (
    <div className="relative ">
      {session?.user?.name && (
        <>
          <div className="flex flex-row justify-between w-full select-none text-th-textLight">
            {mode === "REPLY" ? <h1>Commenting as {session.user.name}</h1> : <div className="py-2"></div>}
            {(postCommentMutation.isError || editCommentMutation.isError  || err) && (
              <h1 className="text-xs text-th-red">Something went wrong</h1>
            )}
          </div>
          {/* Retiring this until reddit markdown can be fully properly supported */}
          {/* <Editor
            editorRef={(ref) => (EditorRef.current = ref)}
            onFocus={() => {
              setReplyFocus(true);
            }}
            onBlur={() => {
              setReplyFocus(false);
            }}
            toolbarClassName={
              "absolute bottom-2 !bg-green-500 !rounded-lg !p-0 w-full !m-0 flex flex-row items-center !border-none "
            }
            editorClassName={
              "scrollbar-thin scrollbar-thumb-lightScroll dark:scrollbar-thumb-darkScroll scrollbar-thumb-rounded-full bg-lightBG dark:bg-darkHighlight border  hover:cursor-text border-lightBorder flex-wrap focus-within:border-lightBorderHighlight focus-within:brightness-100 leading-tight  brightness-80 dark:border-darkBorder dark:focus-within:border-darkBorderHighlight rounded-lg px-4 pb-8"
            }
            editorState={editorState}
            toolbarHidden
            toolbar={editor}
            onEditorStateChange={editorStateChange}
          /> */}
          <textarea
            onClick={(e) => {e.stopPropagation();}}
            onFocus={() => {
              setReplyFocus(true);
            }}
            onBlur={() => {
              setReplyFocus(false);
            }}
            ref={EditorRef}
            className="flex-wrap w-full px-3 pt-3 pb-8 font-mono text-sm leading-tight border rounded-lg outline-none scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-thumb-rounded-full bg-th-postHover hover:cursor-text border-th-border focus-within:border-th-borderHighlight focus-within:brightness-100 brightness-80 "
            value={textValue}
            onChange={handleTextChange}
          ></textarea>
          <div className="flex flex-wrap items-end justify-between w-full mt-2">
            <p className="mb-1 ml-1 text-xs italic select-none text-th-textLight">
              using markdown editor
            </p>
            <div className="flex items-end justify-end gap-2 ml-auto">
              <button
                aria-label="cancel"
                disabled={postCommentMutation.isLoading || editCommentMutation.isLoading}
                onClick={(e) => onCancel(e)}
                className={
                  "flex items-center relative justify-center w-32 px-4 py-1.5 ml-auto text-center border border-th-border hover:border-th-borderHighlight hover:bg-th-highlight rounded-md cursor-pointer  "
                }
              >
                <span
                  className={
                    postCommentMutation.isLoading || editCommentMutation.isLoading ? " opacity-50 " : " mx-3 "
                  }
                >
                  Cancel
                </span>
              </button>
              <button
                aria-label="post comment"
                disabled={postCommentMutation.isLoading}
                onClick={(e) => submit(e)}
                className={
                  "flex items-center relative justify-center w-32 px-4 py-1.5 ml-auto text-center border border-th-border hover:border-th-borderHighlight hover:bg-th-highlight rounded-md cursor-pointer  "
                }
              >
                <span
                  className={
                    postCommentMutation.isLoading || editCommentMutation.isLoading ? " opacity-50 " : " mx-3 "
                  }
                >
                  {mode === "EDIT" ? "Edit" : "Comment"}
                </span>
                {postCommentMutation.isLoading || editCommentMutation.isLoading && (
                  <div className="flex flex-none ">
                    <ImSpinner2 className="ml-2 animate-spin" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommentReply;
