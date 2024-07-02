import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  userId: "63701cc1f03239b7f700000e",
  quiz:{
    loading: false,
    questions: [],
    summary: ""
  },
  currentChunk: 0
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setChunks: (state, action) => {
      state.chunks = action.payload;
    },
    setQuiz: (state, action) => {
      // console.log(action.payload)
      const payload = action.payload;
      if(payload){
        if (payload.hasOwnProperty("loading")) {
          state.quiz.loading = payload.loading;
        }
        if (payload.hasOwnProperty("summary")) {
          state.quiz.summary = payload.summary;
        }
        if (payload.hasOwnProperty("questionsMCQs")) {
          if(state.quiz.questions.length === 0){
            state.quiz.questions = payload.questionsMCQs;
          }
          else{
            state.quiz.questions = [...state.quiz.questions, ...payload.questionsMCQs];
          }
        }
        if (payload.hasOwnProperty("questionsFAQs")) {
          if(state.quiz.questions.length === 0){
            state.quiz.questions = payload.questionsFAQs;
          }
          else{
            state.quiz.questions = [...state.quiz.questions, ...payload.questionsFAQs];
          }
        }
      }
      else{
        state.quiz.loading = false
        state.quiz.summary = ""
        state.quiz.questions = []
      }
    },
    setPdfName: (state, action) => {
      state.pdfName = action.payload;
    },
    setCurrentChunk: (state, action) => {
      state.currentChunk = action.payload
    }
  },
});

export const { setMode, setChunks, setQuiz, setPdfName, setCurrentChunk } = globalSlice.actions;

export default globalSlice.reducer;
