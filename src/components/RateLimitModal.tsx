import { Dialog } from "@headlessui/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { BiCommentError } from "react-icons/bi";
import { MdErrorOutline } from "react-icons/md";
import { useMainContext } from "../MainContext";
import Modal from "./ui/Modal";
import { useTAuth } from "../PremiumAuthContext";
import { useSession, signIn } from "next-auth/react";

const CountDown = ({ timeout, start }: { timeout: number; start: Date }) => {
  const [remaining, setRemaining] = useState<number>();
  useEffect(() => {
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    let rem = Math.max(Math.floor(timeout - diff / 1000), 0);
    setRemaining(rem);

    let interval;
    if (rem > 0) {
      interval = setInterval(() => {
        setRemaining((r) => Math.max((r ?? rem) - 1, 0));
      }, 1000);
    }
    return () => {
      interval && clearInterval(interval);
    };
  }, [timeout, start]);
  return <>{remaining}</>;
};

const PremiumModal = () => {
  const [open, setOpen] = useState(0);
  const context: any = useMainContext();
  const { status: sessionStatus } = useSession();
  const { isLoaded, premium } = useTAuth();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (context.rateLimitModal?.show) {
      setOpen((o) => (o += 1));
    } else {
      setOpen(0);
    }
  }, [context?.rateLimitModal?.show]);
  return (
    <Modal
      toOpen={open}
      onClose={() => context.setRateLimitModal((r) => ({ ...r, show: false }))}
    >
      <div className="inline-block overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full bg-th-post">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-th-base">
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10 ">
              <BiCommentError
                className="w-8 h-8 text-th-accent"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="mt-1 text-lg font-medium leading-6 text-th-text"
              >
                Rate limited
              </Dialog.Title>
              <div className="mt-3">
                <p className="text-sm text-th-text opacity-80">
                  Exceeded Reddit rate limits
                  {context.rateLimitModal?.timeout && (
                    <>
                      <br />
                      Waiting{" "}
                      <span className="text-mono">
                        <CountDown
                          timeout={context.rateLimitModal.timeout}
                          start={context.rateLimitModal?.start ?? new Date()}
                        />
                      </span>{" "}
                      seconds
                    </>
                  )}
                  <br />
                  <br />
                  {premium?.isPremium !== true
                    ? "Sign up to become a troddit+ member for elevated access."
                    : sessionStatus === "unauthenticated" &&
                      "Signing in with Reddit may grant greater limits. "}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-th-background2 sm:px-6 sm:flex sm:flex-row-reverse">
          {premium?.isPremium !== true ? (
            <Link
              href={"/sign-up"}
              aria-label="sign in"
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium border border-transparent rounded-md shadow-sm bg-th-accent hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                context.setRateLimitModal((r) => ({ ...r, show: false }));
              }}
            >
              Sign Up
            </Link>
          ) : (
            sessionStatus === "unauthenticated" && (
              <button
                aria-label="close"
                type="button"
                className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium border border-transparent rounded-md shadow-sm bg-th-accent hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:ml-3 sm:w-auto sm:text-sm sm:mt-0"
                onClick={() => {
                  context.setRateLimitModal((r) => ({ ...r, show: false }));
                  signIn("reddit");
                }}
              >
                Sign In
              </button>
            )
          )}

          <button
            aria-label="close"
            type="button"
            className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-black bg-white border rounded-md shadow-sm border-th-border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() =>
              context.setRateLimitModal((r) => ({ ...r, show: false }))
            }
            ref={cancelButtonRef}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PremiumModal;
