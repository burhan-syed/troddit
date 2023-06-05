import { NextRequest, NextResponse } from "next/server";
import supabase from "../../../lib/supabase";
import { ROUTES_TYPES } from "../../../../types/logs";

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
  let { data, error } = await supabase.rpc("increment_log", {
    c_date: new Date(),
    is_oauth: body?.is_oauth ?? false,
    route_type: body.route_type,
  });

  if (error) {
    console.error("Err?", error);
    return new NextResponse(undefined, {
      status: 500,
      statusText: "Log Error",
    });
  }
  return new NextResponse(undefined, { status: 200 });
};

export default handler;
