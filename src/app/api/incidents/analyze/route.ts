import { NextRequest } from "next/server";
import { POST as handleAnalyze } from "../route";

export async function POST(request: NextRequest) {
  return handleAnalyze(request);
}
