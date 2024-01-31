import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authenticate } from "../services/ApiHandler";
import backgroundImg from "../assets/FlightAIBackground-min.png";
import styled from "@emotion/styled";

const TitleText = styled(Typography)({
  color: "white",
  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.6)", // Adds shadow to the text
});

const StyledTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#365b80",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#365b80",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#365b80",
    },
  },
});

const Index = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Starting cloud server...")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await authenticate(password);
      if (response?.status === 200) {
        sessionStorage.setItem("userPassword", password);

        navigate("/geopt");
      }
    } catch (error) {
      console.error("Error authenticating", error);
      window.alert(error);
    }
    setIsLoading(false);
    setPassword("");
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      timeout = setTimeout(() => {
        setLoadingText("Still starting... Sorry for the wait.");
      }, 30000);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, setLoadingText]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <TitleText variant="h3" sx={{ color: "white", mb: 4 }}>
        Welcome to Chat GeoPT
      </TitleText>
      <div
        className={"passwordContainer"}
        style={{
          display: "flex",
          width: "50%",
          gap: "1rem",
          justifyContent: "center",
          height: "3.5rem",
        }}
      >
        {isLoading ? (
          <React.Fragment>
            <CircularProgress size={24} sx={{ color: "white " }} />
            <TitleText variant="h5" sx={{ color: "white" }}>
              {loadingText}
            </TitleText>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <StyledTextField
              label="Please enter a password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2, width: "25rem" }}
            />
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              type="submit"
              sx={{ bgcolor: "#365b80" }}
            >
              Submit
            </Button>
          </React.Fragment>
        )}
      </div>
    </Box>
  );
};

export default Index;
