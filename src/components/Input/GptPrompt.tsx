import React, { useState, useEffect } from "react";
import {
  IconButton,
  SvgIcon,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import Styles from "./GptPrompt.module.css";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import GeoApi from "../../data/geo/Api";
import {
  currentChatResponseState,
  isLoadingGeoPTResponseState,
} from "../../data/geo/Reducer";
import { useSelector } from "react-redux";

const GptPrompt = () => {
  const isLoadingGeoPTResponse = useSelector(isLoadingGeoPTResponseState);
  const currentChatGeoPTResponse = useSelector(currentChatResponseState);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState("");
  const boxHeight = displayedText.length > 0 ? "auto" : "0px";

  const handleSubmit = () => {
    if (canSubmit) {
      const body = JSON.stringify({ prompt: userPrompt });
      GeoApi.getAndLoadChatGeoPTResponse(body);
    }
    setUserPrompt("");
    setCanSubmit(false);
  };

  const typingSpeed = 50; // milliseconds

  useEffect(() => {
    if (isLoadingGeoPTResponse) {
      setDisplayedText("");
    }

    if (currentChatGeoPTResponse) {
      setDisplayedText(currentChatGeoPTResponse);
    }
  }, [currentChatGeoPTResponse, isLoadingGeoPTResponse]);

  return (
    <div className={Styles.conversationContainer}>
      {displayedText.length > 0 && (
        <Box
          sx={{
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "height 0.5s ease",
            height: boxHeight,
            opacity: 0.9,
            zIndex: 1000,
          }}
        >
          {displayedText}
        </Box>
      )}
      <div className={Styles.inputContainer}>
        <TextField
          className={Styles.promptInput}
          id="outlined-multiline-static"
          label="GeoPT Prompt"
          placeholder="Ask anything about active flights..."
          multiline
          value={userPrompt}
          sx={{
            width: "85%",
            backgroundColor: "white",
            zIndex: 1000,
            opacity: 0.9,
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
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
          {isLoadingGeoPTResponse ? (
            <CircularProgress size={24} /> // Display spinner when loading
          ) : (
            <ArrowUpwardIcon /> // Otherwise display the arrow icon
          )}
        </IconButton>
      </div>
    </div>
  );
};

export default GptPrompt;
