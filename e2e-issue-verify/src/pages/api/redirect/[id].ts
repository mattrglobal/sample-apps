import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";
import { z } from "zod";

const RedirectReqQuerySchema = z.object({
  id: z.string(),
  tenantDomain: z.string(),
});

/**
 * MATTR Wallet will visit this API route once it scanned the QR code that contains a redirect.
 * The route is responsible for redirecting MATTR wallet to retrieve & interpret the signed presentation request, so that the wallet knows which credential is requested in order to display the UIs accordingly.
 * It does the following to achieve that:
 *
 * 1. Extract id from req.query
 * 2. Extract tenantDomain from req.query
 * 3. Search db where id === PresentationRquest.id
 * 4. Extract signedJws PresentationRquest retrieved from DB
 * 5. Construct redirect URL using tenantDomain & signedJws
 * 6. Redirect users to URL -> In this case, the actual PresentationRquest (signed)
 * @param req
 * @param res
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id, tenantDomain } = RedirectReqQuerySchema.parse(req.query);
  const record = await prisma.presentationRequest.findUnique({
    where: { id },
    select: { signedJws: true },
  });
  if (!record) {
    res.status(404).json({ message: "Presentation request not found" });
  } else {
    res.redirect(302, `https:${tenantDomain}?request=${record.signedJws}`);
  }
}

export default handler;
