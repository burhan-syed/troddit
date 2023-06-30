// import { , NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ACCEPT_EMAILS = JSON.parse(
  process?.env?.NEXT_PUBLIC_ACCEPT_EMAILS ?? "false"
);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default async function handler(req, res) {
  const body = req.body;

  if (!body.email) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "email not found" });
  }

  if (!validateEmail(body.email)) {
    return res.status(400).json({ data: "invalid email" });
  }

  if (ACCEPT_EMAILS) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase Credentials");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("email_signups")
      .insert([{ email: body.email }])
      .select();

    if (error && error.code !== "23505") {
      console.error("Err?", error);
      return new res.status(500).json({ data: "something went wrong" });
    }
    return res
      .status(200)
      .json({
        data: `email submitted, you will be contacted when sign ups are available`,
      });
  }
  return res.status(401).json({ data: "not accepting emails" });
}
