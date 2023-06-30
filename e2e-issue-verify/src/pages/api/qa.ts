import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = "Utility endpoint for testing service function calls";
  res.status(200).json({ data });
}
