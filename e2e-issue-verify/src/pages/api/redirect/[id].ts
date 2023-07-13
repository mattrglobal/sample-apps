import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract id from req.query
  // Extract tenantDomain from req.query
  // Search db where id === PresentationRquest.id
  // Extract signedJws PresentationRquest retrieved from DB
  // Construct redirect URL using tenantDomain & signedJws
  // Redirect users to URL -> In this case, the actual PresentationRquest (signed)

  const id = req.query.id as string;
  const tenantDomain = req.query.tenantDomain as string;
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