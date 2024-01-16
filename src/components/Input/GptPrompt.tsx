import React, { useState } from "react";
import { IconButton, SvgIcon, TextField } from "@mui/material";
import Styles from "./GptPrompt.module.css";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import GeoApi from "../../data/geo/Api";

const GptPrompt = () => {
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  const handleSubmit = () => {
    if (canSubmit) {
      const body = JSON.stringify({ prompt: userPrompt });
      GeoApi.getAndLoadChatGeoPTResponse(body);
    }
    setUserPrompt("");
    setCanSubmit(false);
  };

  return (
    <div className={Styles.promptInputContainer}>
      <TextField
        className={Styles.promptInput}
        id="outlined-multiline-static"
        label="GeoPT Prompt"
        placeholder="Ask anything about active flights..."
        multiline
        value={userPrompt}
        sx={{
          width: "80%",
          backgroundColor: "white",
          zIndex: 1000,
          opacity: 0.9,
        }}
        onChange={(e) => {
          if (e.target.value.length > 0) {
            setCanSubmit(true);
          } else {
            setCanSubmit(false);
          }
          setUserPrompt(e.target.value);
        }}
      />
      <IconButton
        disabled={!canSubmit}
        onClick={handleSubmit}
        sx={{
          backgroundColor: "white",
          height: "3.5rem",
          width: "3.5rem",
          alignSelf: "flex-end",
          border: "1px solid lightgrey",
          borderRadius: "5px",
          zIndex: 1000,
          opacity: 0.9,
        }}
      >
        <ArrowUpwardIcon />
      </IconButton>
    </div>
  );
};

export default GptPrompt;
