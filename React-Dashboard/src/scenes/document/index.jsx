import React, { useState } from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import {
  CloudUpload,
  Send,
  CheckCircle
} from "@mui/icons-material";
import {
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Typography,
  CircularProgress
} from "@mui/material";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Backdrop from '@mui/material/Backdrop';  

import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from "react-redux";
import { setChunks, setQuiz, setPdfName } from "state";
import { useSelector } from "react-redux";

const Document = () => {
  // variables
  const theme = useTheme();
  const isNonMediumScreens = useMediaQuery("(min-width: 1600px)");
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64File, setBase64File] = useState(null);
//   const [chunks, setChunks] = useState(null);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const pdfName = useSelector((state) => state.global.pdfName);

  // handlers
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    dispatch(setPdfName(file.name))

    // convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      setBase64File(reader.result);
    };
    reader.onerror = function() {
      console.log('Error: ', reader.error);
    };
  };

  const handleFileUpload = async () => {
    try {
      setUploading(true); // Start the uploading process
      dispatch(setQuiz(null))
      dispatch(setChunks(null))
      const response = await axios.post('http://127.0.0.1:5000/chunks', {
        encoding: base64File
      });
      dispatch(setChunks(response.data))
      toast.success("Quiz generated successfully");
    } catch (error) {
      console.error('Error fetching API:', error);
      toast.error("Failed to generate quiz");
    } finally {
      setUploading(false); // Stop the uploading process
    }
  };

  //jsx
  return (
    <Box
      m="3.5rem 2.5rem"
    >
      <ToastContainer />
      {/* <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploading}
      >
        <CircularProgress size={20} color="inherit" />
      </Backdrop> */}
      <FlexBetween>
        <Header
          title="UPLOAD DOCUMENT"
          subtitle="Welcome to the Upload Document page, where you can effortlessly share your PDFs and unlock an interactive quiz tailored just for you!"
        />
      </FlexBetween>
      <Box
        mt="40px"
        display="grid"
        width={isNonMediumScreens ? "75%" : "100%"}
        gridAutoRows="260px"
        sx={{
          "& > div": { gridColumn: isNonMediumScreens ? undefined : "span 12" },
        }}
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.55rem"
        p="2rem"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            component="label"
            htmlFor="upload-button"
            width="300px"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selectedFile ? theme.palette.success.light : theme.palette.secondary[300],
              color: theme.palette.primary[600],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 60px",
              borderRadius: '4px',
              cursor: 'pointer',
              "&:hover": {
                opacity: 0.9,
              }
            }}
          >
            {selectedFile ? <CheckCircle /> : <CloudUpload />}
            {pdfName ? 'CHANGE DOCUMENT' : 'UPLOAD DOCUMENT'}
            <input
              accept="application/pdf"
              style={{ display: "none" }}
              id="upload-button"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </Box>
          {(selectedFile || pdfName)  && (
            <Box display="flex" alignItems="center" mt="1rem">
              <Box
                component={Typography}
                variant="subtitle1"
                ml="0.5rem"
                sx={{ color: theme.palette.secondary.main }}
              >
                {pdfName ? pdfName : selectedFile.name}
              </Box>
            </Box>
          )}
          <Button
            sx={{
              marginTop: '1rem',
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 60px",
              "&:hover": {
                backgroundColor: theme.palette.secondary[300],
                opacity: 0.9,
              },
              backgroundColor: theme.palette.secondary[300],
              color: theme.palette.primary[600],
              width: "300px"
            }}
            disabled={!base64File || uploading} // Disable when no file selected or during uploading
            startIcon={!uploading ? <Send /> : <Send /> }
            endIcon={!uploading ? null : <CircularProgress size={14} thickness={5} />}
            onClick={handleFileUpload}
          >
            {uploading ? "GENERATING..." : "GENERATE QUIZ"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Document;
