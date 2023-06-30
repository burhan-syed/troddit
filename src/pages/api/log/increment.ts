import { NextRequest, NextResponse } from "next/server";
import { ROUTES_TYPES } from "../../../../types/logs";
import { createClient } from "@supabase/supabase-js";
const LOG_REQUESTS = JSON.parse(
  process?.env?.NEXT_PUBLIC_ENABLE_API_LOG ?? "false"
);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const config = {
  runtime: "edge",
};

const handler = async (request: NextRequest) => {
  const body = await request.json();
  //console.log("B?", body);
  const route_type = body?.route_type;
  if (
    !Object.values(ROUTES_TYPES).includes(route_type) ||
    !(typeof body?.is_oauth === "boolean")
  ) {
    return new NextResponse(undefined, {
      status: 400,
      statusText: "invalid body",
    });
  }
  if (LOG_REQUESTS) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase Credentials");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let { data, error } = await supabase.rpc("increment_log", {
      c_date: new Date(),
      is_oauth: body?.is_oauth ?? false,
      route_type: route_type,
    });

    if (error) {
      console.error("Err?", error);
      return new NextResponse(undefined, {
        status: 500,
        statusText: "Log Error",
      });
    }
  }

  return new NextResponse(undefined, {
    status: 200,
    statusText: LOG_REQUESTS ? `logged ${route_type}` : "logging disabled",
  });
};

export default handler;
