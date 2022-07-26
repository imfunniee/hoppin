import type { NextApiRequest, NextApiResponse } from "next";
import { Hop, APIAuthentication } from "@onehop/js";

const rateLimit = require("lambda-rate-limiter")({
  interval: 10 * 1000,
}).check;

const hop = new Hop(process.env.HOP_TK as APIAuthentication);

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { text, user, color } = req.body;
    if (!text || !user) throw new Error("text or user empty");
    await rateLimit(5, req.headers["x-real-ip"]);
    await hop.channels.publishMessage(
      process.env.CHANNEL_ID as string,
      "ROOM_MESSAGE",
      {
        text,
        user,
        color,
        time: Date.now(),
      }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
}
