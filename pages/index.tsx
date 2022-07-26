import type { NextPage } from "next";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import {
  useChannelMessage,
  useConnectionState,
  useReadChannelState,
} from "@onehop/react";
import { toast } from "react-hot-toast";
import axios from "axios";

import styles from "../styles/home.module.scss";

interface Message {
  user: string;
  color: string;
  text: string;
  time: number;
}

const Home: NextPage = () => {
  const [user, setUser] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [input, setInput] = useState("");

  const connection = useConnectionState();
  const state = useReadChannelState(process.env.CHANNEL_ID as string);

  useChannelMessage<{ message: string }>(
    process.env.CHANNEL_ID as string,
    "ROOM_MESSAGE",
    (data) => {
      setMessages((obj) => [[...obj], data as unknown as Message].flat(999));
    }
  );

  const _handleChange = (event: ChangeEvent<{ value: string }>) => {
    setInput(event?.currentTarget?.value);
  };

  const _sendMessage = async () => {
    try {
      if (!input) return toast.error("message empty");
      if (input.startsWith("/")) {
        switch (input.split(" ")[0].replace("/", "").toLocaleLowerCase()) {
          case "name":
            if (input.split("/name ")[1].toString().length > 30)
              return toast.error("name too long");
            setUser(input.split("/name ")[1].toString());
            break;
          case "color":
            const tempColor = input
              .split("/color ")[1]
              .match(/^#(?:[0-9a-f]{3}){1,2}$/i);
            tempColor ? setColor(tempColor[0]) : setColor("#ffffff");
            break;
          default:
            setInput("");
            break;
        }
        setInput("");
      } else {
        setInput("");
        await axios.post(
          "/api/send",
          { text: input, user, color },
          {
            headers: {
              "content-type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("error sending message");
    }
  };

  const _handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Enter") {
      _sendMessage();
    }
  };

  useEffect(() => {
    if (connection === "connected" && state?.subscription === "available")
      setConnected(true);
    setUser(`user_${(Math.random() + 1).toString(36).substring(7)}`);
  }, [connection, state]);

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.header}>
          <div>Messages</div>
          <div data-src={connected ? "true" : "false"}>
            {connected ? (
              <i className="ri-check-double-fill"></i>
            ) : (
              <i className="ri-loader-5-line"></i>
            )}
          </div>
        </div>
        <div className={styles.chat_container}>
          {messages
            .sort((a, b) => b.time - a.time)
            .map((e) => (
              <div key={e.time}>
                <b style={{ color: e.color || "#ffffff" }}>{e.user}</b>{" "}
                <span>{new Date(e.time).toLocaleTimeString()}</span> : {e.text}
              </div>
            ))}
        </div>
        <div className={styles.input_container}>
          <div>
            <input
              type={"text"}
              value={input}
              onChange={(e) => _handleChange(e)}
              onKeyDown={(e) => _handleKeyDown(e)}
              placeholder={"Message"}
              disabled={!connected}
            />
            <label>
              use /name [abc] and /color [#fff] to set your name and color
              respectively
            </label>
          </div>
          <button onClick={() => _sendMessage()} disabled={!connected}>
            Send <i className="ri-send-plane-2-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
