import { NextRequest, NextResponse } from "next/server";
import { ROUTES_TYPES } from "../../../../types/logs";
import { createClient } from "@supabase/supabase-js";
const ENABLE_API_LOG = JSON.parse(process?.env?.ENABLE_API_LOG ?? "false");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const config = {
  runtime: "experimental-edge",
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
  if (ENABLE_API_LOG) {
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
    statusText: ENABLE_API_LOG ? `logged ${route_type}` : "logging disabled",
  });
};

export default handler;
