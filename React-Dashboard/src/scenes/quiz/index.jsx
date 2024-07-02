import React, { useState, useEffect } from 'react';
import { Button, Typography, TextField,  LinearProgress, Box, Tab, Tabs, useTheme, Divider, CircularProgress } from '@mui/material';
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import Tooltip from '@mui/material/Tooltip';
import { IconButton } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';
import Popover from '@mui/material/Popover';
import { useSelector } from "react-redux";
import axios from 'axios';
import { setCurrentChunk, setQuiz } from "state";
import { useDispatch } from "react-redux";
import Backdrop from '@mui/material/Backdrop'; 
import { ToastContainer, toast } from 'react-toastify';
import { Co2Sharp, QueuePlayNextOutlined, SatelliteAlt } from '@mui/icons-material';

const answerMapping = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3
}

// const quiz = {
//     topic: 'Javascript',
//     level: 'Beginner',
//     totalQuestions: 4,
//     perQuestionScore: 5,
//     questions: [
//       {
//         question: 'Describe the following Javascript topics',
//         topics: ['Closures', 'Prototypes', 'Hoisting'],
//         type: 'Descriptive',
//         choicesDescriptions: [
//             'The "var" keyword declares a variable, optionally initializing it to a value. But it is function scoped and hoisted, which may cause some unexpected results.',
//             'The "let" keyword declares a block-scoped local variable, optionally initializing it to a value. It is a more modern choice compared to "var".',
//             'In JavaScript, we can define variables using both "var" and "let" keywords.',
//         ],
//       },
//       {
//         question: 'Which function is used to serialize an object into a JSON string in Javascript?',
//         choices: ['stringify()', 'parse()', 'convert()', 'None of the above'],
//         type: 'MCQs',
//         correctAnswer: 'stringify()',
//         choicesDescriptions: [
//             'The "var" keyword declares a variable, optionally initializing it to a value. But it is function scoped and hoisted, which may cause some unexpected results.',
//             'The "let" keyword declares a block-scoped local variable, optionally initializing it to a value. It is a more modern choice compared to "var".',
//             'In JavaScript, we can define variables using both "var" and "let" keywords.',
//             'We can definitely use "var" or "let" to define a variable in JavaScript.'
//         ],
//       },
//       {
//         question: 'Which of the following keywords is used to define a variable in Javascript?',
//         choices: ['var', 'let', 'var and let', 'None of the above'],
//         type: 'MCQs',
//         correctAnswer: 'var and let',
//         choicesDescriptions: [
//             'The "var" keyword declares a variable, optionally initializing it to a value. But it is function scoped and hoisted, which may cause some unexpected results.',
//             'The "let" keyword declares a block-scoped local variable, optionally initializing it to a value. It is a more modern choice compared to "var".',
//             'In JavaScript, we can define variables using both "var" and "let" keywords.',
//             'We can definitely use "var" or "let" to define a variable in JavaScript.'
//         ],
//       },
      
//     ],
// }

const Question = ({questions, handleNextChunk}) => {
    const theme = useTheme();
    // const { questions } = quiz;

    const [activeQuestion, setActiveQuestion] = useState(0);
    const [isSelectedAnswerCorrect, setIsSelectedAnswerCorrect] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
    });

    const { question, choices, correctAnswer, choicesDescriptions } = questions[activeQuestion];
    const [descriptiveAnswers, setDescriptiveAnswers] = useState({});

    const handleDescriptiveAnswerChange = (topic, answer) => {
        setDescriptiveAnswers(prev => ({ ...prev, [topic]: answer }));
    };

    const onClickNext = () => {
        setSelectedAnswerIndex(null);
        setResult((prev) =>
        isSelectedAnswerCorrect
            ? {
                ...prev,
                score: prev.score + 10,
                correctAnswers: prev.correctAnswers + 1,
            }
            : { ...prev, wrongAnswers: prev.wrongAnswers + 1 }
        );
        if (activeQuestion !== questions.length - 1) {
            setActiveQuestion((prev) => prev + 1);
        } else {
            setActiveQuestion(0);
            setShowResult(true);
        }
    };
  
    const onAnswerSelected = (answer, index) => {
        setSelectedAnswerIndex(index);
        console.log(answerMapping[correctAnswer], answer)
        setIsSelectedAnswerCorrect(index === answerMapping[correctAnswer]);
    };
  
    const addLeadingZero = (number) => (number > 9 ? number : `0${number}`);

    return (
      <Box m="3rem 2rem">
        {!showResult ? (
            questions[activeQuestion].type === 'MCQS' ? (
                <QuestionView
                    activeQuestion={activeQuestion}
                    question={question}
                    choices={choices}
                    addLeadingZero={addLeadingZero}
                    onAnswerSelected={onAnswerSelected}
                    selectedAnswerIndex={selectedAnswerIndex}
                    theme={theme}
                    onClickNext={onClickNext}
                    totalQuestions={questions.length}
                    choicesDescriptions={choicesDescriptions}
                    correctAnswerIndex={correctAnswer}
                />
            ) :(
                <DescriptiveView
                    topics={questions[activeQuestion].topics}
                    onAnswerChange={handleDescriptiveAnswerChange}
                    theme={theme}
                    question={question}
                    onClickNext={onClickNext}
                    selectedAnswerIndex={selectedAnswerIndex}
                    activeQuestion={activeQuestion}
                    totalQuestions={questions.length}
                    descriptiveAnswers={descriptiveAnswers}
                    questions={questions}
                    addLeadingZero={addLeadingZero}
                    choicesDescriptions={choicesDescriptions}
                    setDescriptiveAnswers={setDescriptiveAnswers}
                    setResult={setResult}
                />
            )
        ) : (
          <ResultView 
            totalQuestions={questions.length}
            result={result}
            handleNextChunk={handleNextChunk}
          />
        )}
      </Box>
    );
};
  
const QuestionView = ({ activeQuestion, question, choices, addLeadingZero, onAnswerSelected, selectedAnswerIndex, theme, onClickNext, totalQuestions, choicesDescriptions, correctAnswerIndex}) => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerSubmit = () => {
        setIsSubmitted(true);
    };

    const handleNext = () => {
        onClickNext();
        setIsSubmitted(false);
    };
    
    return (
    <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  borderBottom: `1px solid ${theme.palette.primary[900]}`}}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 500, color: theme.palette.primary[300] }}>
                    {addLeadingZero(activeQuestion + 1)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.primary[700], ml: 1 }}>
                    /{addLeadingZero(totalQuestions)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={"Upvote"} arrow>
                    <IconButton variant="outlined">
                        <ThumbUpOutlinedIcon   sx={{ color: theme.palette.primary[300] }}/>
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Downvote"} arrow>
                    <IconButton>
                        <ThumbDownOutlinedIcon sx={{ color: theme.palette.primary[300] }}/>
                    </IconButton>
                </Tooltip>
                    <Tooltip title={"Hint"} arrow>
                    <IconButton>
                        <LightbulbOutlinedIcon sx={{ color: theme.palette.primary[300] }}/>
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 500, color: theme.palette.primary[300], mt: 3 }}>{question}</Typography>
        <Box >
            {choices.map((answer, index) => (
                <ChoiceBox
                    key={answer}
                    answer={answer}
                    index={index}
                    selectedAnswerIndex={selectedAnswerIndex}
                    onAnswerSelected={onAnswerSelected}
                    theme={theme}
                    description={choicesDescriptions[index]}
                    isSubmitted={isSubmitted}
                    correctAnswerIndex={correctAnswerIndex}
                />
            ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={selectedAnswerIndex === null ? "Select an answer" : "Submit your answer"} arrow>
                <span>
                    <Button
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswerIndex === null || isSubmitted}
                        sx={{
                            backgroundColor: theme.palette.primary[400],
                            color: theme.palette.background.alt,
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "10px 40px",
                            mt: 2,
                            '&.Mui-disabled': {
                                color: theme.palette.background.alt,
                                backgroundColor: theme.palette.primary[400] + '80' // adding '80' to end of color makes it 50% transparent
                            },
                            '&:hover': {
                                backgroundColor: theme.palette.primary[500],  // change this color to what you want when hovered
                            }, 
                        }}
                        >
                        Submit answer
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title={selectedAnswerIndex === null || !isSubmitted ? "Submit your answer first" : "Move to next question"} arrow>
                <span>
                    <Button
                        onClick={handleNext}
                        disabled={selectedAnswerIndex === null || !isSubmitted}
                        sx={{
                            backgroundColor: theme.palette.primary[400],
                            color: theme.palette.background.alt,
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "10px 40px",
                            ml: 1,
                            mt: 2,
                            '&.Mui-disabled': {
                                color: theme.palette.background.alt,
                                backgroundColor: theme.palette.primary[400] + '80' // adding '80' to end of color makes it 50% transparent
                            },
                            '&:hover': {
                                backgroundColor: theme.palette.primary[500],  // change this color to what you want when hovered
                            }, 
                        }}
                        >
                        {activeQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </Button>
                </span>
            </Tooltip>
        </Box>
    </Box>
    )
};
  
const ChoiceBox = ({ answer, index, selectedAnswerIndex, onAnswerSelected, theme, description, isSubmitted, correctAnswerIndex }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
  
    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handlePopoverClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
  
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center', // Align items vertically within the flex container
          justifyContent: 'space-between', // Distribute items evenly along the horizontal axis
          mt: 3,
        }}
      >
        <Box
          onClick={() => onAnswerSelected(answer, index)}
          sx={{
            color: theme.palette.primary[100],
            fontSize: 14,
            background: '#ffffff',
            border: `1px solid ${theme.palette.primary[900]}`,
            borderRadius: 5,
            p: 1,
            cursor: 'pointer',
            flex: '1',
            ...(selectedAnswerIndex === index && !isSubmitted && { background: theme.palette.primary[900], border: `1px solid ${theme.palette.primary[300]}` }),
            ...(isSubmitted && index === answerMapping[correctAnswerIndex] && { background: '#90ee90', border: '1px solid #006400' }),
            ...(isSubmitted && selectedAnswerIndex === index && index !== answerMapping[correctAnswerIndex] && { background: '#ffcccb', border: '1px solid #8b0000' }),
          }}
        >
          {answer}
        </Box>
        {isSubmitted && (
            <>
                <Tooltip title={"Description"} arrow>
                    <IconButton
                        variant="outlined"
                        aria-describedby={'hello'}
                        onClick={handlePopoverOpen}
                    >
                        <PsychologyAltOutlinedIcon sx={{ color: theme.palette.primary[300] }} />
                    </IconButton>
                </Tooltip>
                <Popover
                    id={'hello'}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    PaperProps={{
                        sx: {
                        maxWidth: '400px',
                        width: '100%',
                        //   overflow: 'hidden',
                        },
                    }}
                >
                <Box sx={{ p: 2 }}>{description}</Box>
                </Popover>
            </>
        )}
      </Box>
    );
};
 
const ResultView = ({ totalQuestions, result, handleNextChunk }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" sx={{ textAlign: 'center', mb: 10 }}>Result</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Total Question: <span style={{ color: '#800080', fontSize: 22 }}>{totalQuestions}</span>
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Total Score:<span style={{ color: '#800080', fontSize: 22 }}> {result.score}</span>
            </Typography>
            <Tooltip title="Move to next chunk" arrow>
                <Button
                    onClick={handleNextChunk}
                    sx={{
                        backgroundColor: theme.palette.primary[400],
                        color: theme.palette.background.alt,
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '10px 40px',
                        mt: 2,
                        '&.Mui-disabled': {
                            color: theme.palette.background.alt,
                            backgroundColor: theme.palette.primary[400] + '80',
                        },
                        '&:hover': {
                            backgroundColor: theme.palette.primary[500],
                        },
                        mt: 10 
                    }}
                >
                    Next Chunk
                </Button>
            </Tooltip>
        </Box>
    );
};


const DescriptiveView = ({ topics, onAnswerChange, addLeadingZero, theme, question, onClickNext, questions, totalQuestions, activeQuestion, descriptiveAnswers, choicesDescriptions, setDescriptiveAnswers, setResult }) => {
    const [anchorEls, setAnchorEls] = React.useState(new Array(topics.length).fill(null));
    const [gradingResponse, setGradingResponse] = useState(null);
    const chunks = useSelector((state) => state.global.chunks);
    const currentChunk = useSelector((state) => state.global.currentChunk)
    const [loading, setLoading] = useState(false);
  
    const handlePopoverOpen = (event, index) => {
      let newAnchorEls = [...anchorEls];
      newAnchorEls[index] = event.currentTarget;
      setAnchorEls(newAnchorEls);
    };
  
    const handlePopoverClose = (index) => {
      let newAnchorEls = [...anchorEls];
      newAnchorEls[index] = null;
      setAnchorEls(newAnchorEls);
    };

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerSubmit = () => {
        console.log(Object.values(descriptiveAnswers));
        setLoading(true);

        const apiClient = axios.create({
            baseURL: 'http://127.0.0.1:5000',
        });
    
        // Submit descriptive answers to the API
        apiClient.post('/gradeFAQ', {
          answers: Object.values(descriptiveAnswers), // assuming descriptiveAnswers is an object where the key is the topic and the value is the answer
          question: question,
          chunk: chunks[currentChunk], // Put the right value here
        })
        .then((response) => {
            setIsSubmitted(true);
            setGradingResponse(response.data); // Store the response in the state
            setResult((prev) => ({
                ...prev,
                score: prev.score + parseInt(response.data.grade),
                correctAnswers: prev.correctAnswers + 1,
            }));
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
            setLoading(false); // Stop loading when done
        });
      };

    const handleNext = () => {
        setIsSubmitted(false);
        onClickNext();
    };

    const GradedAnswer = ({ option, userResponse, explanation }) => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {option}
            </Typography>
            <Typography variant="subtitle1">
                Your response: <span>{userResponse}</span>
            </Typography>
            <Typography variant="subtitle1">
                Explanation: <span>{explanation}</span>
            </Typography>
        </Box>
    );

    useEffect(() => {
        // Clear descriptiveAnswers when moving to the next question
        setDescriptiveAnswers({});
    }, [activeQuestion]);
    

    return (
        <Box>
        <Box
            sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.primary[900]}`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 500, color: theme.palette.primary[300] }}>
                    {addLeadingZero(activeQuestion + 1)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.primary[700], ml: 1 }}>
                    /{addLeadingZero(totalQuestions)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={"Upvote"} arrow>
                    <IconButton variant="outlined">
                    <ThumbUpOutlinedIcon sx={{ color: theme.palette.primary[300] }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Downvote"} arrow>
                    <IconButton>
                    <ThumbDownOutlinedIcon sx={{ color: theme.palette.primary[300] }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Hint"} arrow>
                    <IconButton>
                    <LightbulbOutlinedIcon sx={{ color: theme.palette.primary[300] }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" sx={{ fontWeight: 500, color: theme.palette.primary[300], mt: 3 }}>
                {question}
            </Typography>
            {isSubmitted && (
                <Tooltip title={"Description"} arrow>
                    <IconButton
                        variant="outlined"
                        aria-describedby={`desc-${1}`}
                        onClick={(event) => handlePopoverOpen(event, 1)}
                        sx={{
                            mt: 3
                        }}
                    >
                        <PsychologyAltOutlinedIcon sx={{ color: theme.palette.primary[300] }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
        {topics.map((topic, index) => (
            <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 100, fontSize: 14, color: theme.palette.primary[700], mt: 3 }}>
                        {`${index + 1}.`}
                    </Typography>
                    <Popover
                        id={`desc-${index}`}
                        open={Boolean(anchorEls[index])}
                        anchorEl={anchorEls[index]}
                        onClose={() => handlePopoverClose(index)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        PaperProps={{
                            sx: {
                                maxWidth: '400px',
                                width: '100%',
                                overflow: 'hidden', 
                            },
                        }}
                    >
                        {gradingResponse && (
                            <Box sx={{ p: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Score: {gradingResponse.grade}</Typography>
                            {topics.map((topic, index) => {
                                const gradedAnswer = gradingResponse["explanations"];
                                const userResponse = descriptiveAnswers[topic];
                                const explanation = gradedAnswer[index]; // Assuming the explanation is the first value in the graded answer
                                return (
                                    <GradedAnswer
                                        key={index}
                                        option={`Option ${index + 1}`}
                                        userResponse={userResponse}
                                        explanation={explanation}
                                    />
                                );
                            })}
                        </Box>
                        )}
                    </Popover>
                </Box>
                <TextField
                    variant="outlined"
                    multiline
                    rows={4}
                    fullWidth
                    onChange={(e) => onAnswerChange(topic, e.target.value)}
                    sx={{
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                            borderColor: theme.palette.primary[800],
                            },
                            '&:hover fieldset': {
                            borderColor: theme.palette.primary[600],
                            },
                            '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary[400],
                            },
                        },
                    }}
                    value={descriptiveAnswers[topic] || ''}
                />
            </Box>
        ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title={!questions[activeQuestion].topics.every((topic) => descriptiveAnswers[topic]) ? "Add all answers" : "Submit your answers"} arrow>
                    <span>
                        <Button
                            onClick={handleAnswerSubmit}
                            disabled={!questions[activeQuestion].topics.every((topic) => descriptiveAnswers[topic]) || isSubmitted || loading}
                            sx={{
                                backgroundColor: theme.palette.primary[400],
                                color: theme.palette.background.alt,
                                fontSize: '14px',
                                fontWeight: 'bold',
                                padding: '10px 40px',
                                mt: 2,
                                '&.Mui-disabled': {
                                color: theme.palette.background.alt,
                                backgroundColor: theme.palette.primary[400] + '80',
                                },
                                '&:hover': {
                                backgroundColor: theme.palette.primary[500],
                                },
                            }}
                            endIcon={!loading ? null : <CircularProgress size={14} thickness={5} />}
                        >
                            {loading ? "Grading..." : "Submit answer"}
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={!isSubmitted ? "Submit your answers first" : "Move to next question"} arrow>
                    <span>
                        <Button
                            onClick={handleNext}
                            disabled={!isSubmitted}
                            sx={{
                                backgroundColor: theme.palette.primary[400],
                                color: theme.palette.background.alt,
                                fontSize: '14px',
                                fontWeight: 'bold',
                                padding: '10px 40px',
                                mt: 2,
                                ml: 1,
                                '&.Mui-disabled': {
                                color: theme.palette.background.alt,
                                backgroundColor: theme.palette.primary[400] + '80',
                                },
                                '&:hover': {
                                backgroundColor: theme.palette.primary[500],
                                },
                            }}
                            >
                            {activeQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
};
   
const Quiz = () => {
    // variables
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const chunks = useSelector((state) => state.global.chunks);
    const currentChunk = useSelector((state) => state.global.currentChunk)
    const quiz = useSelector((state) => state.global.quiz);
    const [isSummaryLoading, setisSummaryLoading] = useState(false);
    const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
    const [isFaqsLoading, setIsFaqsLoading] = useState(false);
    const [summary, setSummary] = useState(null)
    const [text, setText] = useState(null)
    const [questions, setQuestions] = useState([])
    const dispatch = useDispatch();


    // handlers
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const fetchSummary = async () => {
        setisSummaryLoading(true)
        const response = await axios.post('http://127.0.0.1:5000/summary', {
            chunk: chunks[currentChunk]
        });
        dispatch(setQuiz(response.data))
        setSummary(response.data.summary)
        setisSummaryLoading(false)
    };

    const fetchMcqs = async () => {
        setIsQuestionsLoading(true)
        const response = await axios.post('http://127.0.0.1:5000/quizMCQ', {
            chunk: chunks[currentChunk]
        });
        dispatch(setQuiz(response.data))
        dispatch(setQuiz({loading: false}))
        setIsQuestionsLoading(false)
        setQuestions([...questions, ...response.data.questionsMCQs])
    };

    const fetchFaqs = async () => {
        setIsFaqsLoading(true)
        setIsQuestionsLoading(true)
        const response = await axios.post('http://127.0.0.1:5000/quizFAQ', {
            chunk: chunks[currentChunk]
        });
        dispatch(setQuiz(response.data))
        dispatch(setQuiz({loading: false}))
        setIsFaqsLoading(false)
        setIsQuestionsLoading(false)
        setQuestions([...questions, ...response.data.questionFAQs])
    };

    const handleNextChunk = () => {
        setActiveTab(0)
        dispatch(setQuiz(null))
        dispatch(setQuiz({loading: true}))
        setText(chunks[currentChunk + 1])
        dispatch(setCurrentChunk(currentChunk + 1))
        fetchSummary()
        fetchMcqs()
        fetchFaqs()
    }

    const loadData = () => {
        setText(chunks[currentChunk])
        dispatch(setQuiz({loading: true}))
        fetchSummary()
        fetchMcqs()
        fetchFaqs()
    }

    useEffect(() => {
        if (!quiz.summary) {
            loadData()
        }
        else{
            setText(chunks[currentChunk])
            setSummary(quiz.summary)
            setQuestions(quiz.questions)
        }
    }, []);


    return (
        <Box 
            m="3.5rem 2.5rem"
            maxWidth={"1000px"}
        >
            <ToastContainer/>
             <FlexBetween>
                <Header
                    title="Quiz"
                    subtitle="Each chunk of your document has been ingeniously crafted into a quiz. Solve one quiz chunk at a time and journey through your document like never before!"
                />
            </FlexBetween>
            <Box 
                mt="40px"
                gridAutoRows="260px"
                backgroundColor={theme.palette.background.alt}
                borderRadius="0.55rem"
            >
                <Tooltip title={`On chunk ${currentChunk + 1}/${chunks.length}`} arrow>
                    <LinearProgress 
                        variant="determinate" value={((currentChunk + 1)/(chunks.length))*100} 
                        sx={{
                            bgcolor: theme.palette.primary[900],
                            '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.primary[400],
                            },
                        }}
                    />
                </Tooltip>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    TabIndicatorProps={{
                        style: {
                        backgroundColor: theme.palette.primary[100],
                        },
                    }}
                >
                    <Tab 
                        sx={{
                            '&.Mui-selected': {
                                color: theme.palette.primary[100],
                            },
                            color: theme.palette.primary[800],
                        }} 
                        label="Text" 
                        disabled={isSummaryLoading}
                    />
                    <Tab 
                        sx={{
                            '&.Mui-selected': {
                                color: theme.palette.primary[100],
                            },
                            color: theme.palette.primary[800],
                        }} 
                        label={
                            isSummaryLoading ? (
                              <>
                                <span >Summary</span>
                                <CircularProgress
                                  size={14} // Adjust the size of the circular loader as needed
                                  thickness={5} // Adjust the thickness of the circular loader as needed
                                  style={{
                                    color: theme.palette.primary[800],
                                    position: 'absolute', // Position the loader absolutely within the tab
                                    top: '50%', // Center the loader vertically
                                    left: '79px', // Adjust the negative left position to align the loader with the text
                                    marginTop: -7, // Adjust the negative margin to center the loader perfectly
                                  }}
                                />
                              </>
                            ) : (
                              "Summary"
                            )
                        }
                        disabled={isSummaryLoading}
                    />
                    <Tab 
                        sx={{
                            '&.Mui-selected': {
                                color: theme.palette.primary[100],
                            },
                            color: theme.palette.primary[800],
                        }} 
                        label={
                            isQuestionsLoading ? (
                              <>
                                <span >Questions</span>
                                <CircularProgress
                                    size={14} // Adjust the size of the circular loader as needed
                                    thickness={5} // Adjust the thickness of the circular loader as needed
                                    style={{
                                        color: theme.palette.primary[800],
                                        position: 'absolute', // Position the loader absolutely within the tab
                                        top: '50%', // Center the loader vertically
                                        left: '88px', // Adjust the negative left position to align the loader with the text
                                        marginTop: -7, // Adjust the negative margin to center the loader perfectly
                                    }}
                                />
                              </>
                            ) : (
                              "Questions"
                            )
                        } 
                        disabled={isQuestionsLoading}
                    />
                </Tabs>
                <Box
                    mt="10px"
                    minHeight={"500px"}
                    maxHeight={"500px"}
                    sx={{
                        overflow: "auto",
                    }}
                >
                    {activeTab === 0 && (
                        <Box sx={{ p: 3, mt: 3 }}>
                            <Divider sx={{ borderTop: `1px solid ${theme.palette.primary[900]}` }} />
                            <Typography sx={{fontSize: 14,p: 3,mt: 3}}>{text ? text : ''}</Typography>
                        </Box>
                    )}
                    {activeTab === 1 && (
                        <Box sx={{ p: 3, mt: 3 }}>
                            <Divider sx={{ borderTop: `1px solid ${theme.palette.primary[900]}` }} />
                            <Typography sx={{fontSize: 14,p: 3,mt: 3}}>{summary ? summary : ''}</Typography>
                        </Box>
                    )}
                    {activeTab === 2 && (<Question questions={quiz.questions ? quiz.questions : questions} handleNextChunk={handleNextChunk}/>)}
                </Box>
            </Box>
        </Box>
    );
};

export default Quiz;