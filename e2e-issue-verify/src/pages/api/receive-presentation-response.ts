import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Processing response payload against each PresentationRequest
 * 1. Extract req.body -> body
 * 2. Extract challenge from body -> challenge
 * 3. Convert body into string -> RESPONSE
 * 4. Find PresentationRequest from DB by challenge -> ROW
 * 5. Update ROW.response with RESPONSE
 * 6. Return 201 response with success message
 * 
 * Note: Response status can be any 200-level response
 * @param req 
 * @param res 
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const challenge = `PLACEHOLDER`;
  res.status(201).json({ message: "Updated response for ___" });
}
