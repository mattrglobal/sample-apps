import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = "Endpoint for receiving presentation responses";
  res.status(200).json({ data });
}
