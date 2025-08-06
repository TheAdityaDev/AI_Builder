"use client";
import { useState, useRef, useEffect } from 'react';
import { Download, Volume2, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GoogleGenerativeAI } from '@google/generative-ai';

const InterviewAssistant = () => {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interviewType, setInterviewType] = useState('technical');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [progress, setProgress] = useState(0);
  
  const voiceRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize 11Labs voice
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Initialize speech synthesis
    const initVoice = async () => {
      try {
        const synth = window.speechSynthesis;
        voiceRef.current = {
          speak: async (text) => {
            // Create speech utterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Get available voices and select English voice
            const voices = synth.getVoices();
            const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
            if (englishVoice) {
              utterance.voice = englishVoice;
            }

            // Configure speech parameters
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Speak the text
            synth.speak(utterance);

            // Return promise that resolves when speech is complete
            return new Promise((resolve) => {
              utterance.onend = resolve;
            });
          }
        };
      } catch (error) {
        console.error('Failed to initialize speech synthesis:', error);
      }
    };
    
    initVoice();
  }

  return () => {
    if (window?.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };
}, []);
  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setUserInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  };

  const startInterview = async () => {
    setConversation([]);
    setFeedback('');
    setProgress(0);
    
    let question = '';
    if (interviewType === 'technical') {
      question = "Can you walk me through your experience with React and Next.js?";
    } else if (interviewType === 'behavioral') {
      question = "Tell me about a time you faced a difficult challenge at work and how you handled it.";
    } else {
      question = "Why are you interested in this position?";
    }
    
    await speakQuestion(question);
    setConversation([{ role: 'interviewer', content: question }]);
  };

  const speakQuestion = async (question) => {
    setIsSpeaking(true);
    try {
      await voiceRef.current.speak(question);
    } catch (error) {
      console.error('Error speaking:', error);
    }
    setIsSpeaking(false);
  };

  const handleUserResponse = async () => {
    if (!userInput.trim()) return;

    const userResponse = { role: 'user', content: userInput };
    setConversation(prev => [...prev, userResponse]);
    setUserInput('');
    
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(async () => {
      const aiResponse = await generateAIResponse([...conversation, userResponse]);
      setConversation(prev => [...prev, { role: 'interviewer', content: aiResponse }]);
      await speakQuestion(aiResponse);
      setLoading(false);
      setProgress(Math.min(progress + 20, 100));
      
      // Provide feedback at certain points
      if (progress >= 50 && progress < 70) {
        setFeedback("You're doing well! Try to provide more specific examples from your experience.");
      } else if (progress >= 70) {
        setFeedback("Great job! Your answers are detailed. Now focus on connecting your skills to the job requirements.");
      }
    }, 1500);
  };

const generateAIResponse = async (conversationHistory) => {
  const lastUserMessage = conversationHistory[conversationHistory.length - 1].content.toLowerCase();
  
  // Configure Gemini API
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Create interview context based on type
  let context = "";
  let questionCount = 10;
  
  if (interviewType === 'technical') {
    context = `You are an expert technical interviewer. Generate a relevant follow-up question based on the candidate's response: "${lastUserMessage}". 
    Focus on core technical concepts, problem-solving abilities, and practical experience.
    The question should be challenging but fair, encouraging detailed technical explanations.
    Limit responses to ${questionCount} important technical questions.`;
  } else if (interviewType === 'behavioral') {
    context = `You are an experienced HR interviewer. Generate a relevant follow-up behavioral question based on the candidate's response: "${lastUserMessage}".
    Focus on past experiences, conflict resolution, leadership, and teamwork scenarios.
    The question should encourage specific examples and reflection on past experiences.
    Limit responses to ${questionCount} important behavioral questions.`;
  } else {
    context = `You are a professional interviewer. Generate a relevant follow-up general interview question based on the candidate's response: "${lastUserMessage}".
    Focus on career goals, company fit, and professional motivations.
    The question should help assess the candidate's overall suitability and aspirations.
    Limit responses to ${questionCount} important general questions.`;
  }

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    const formattedResponse = response.text();
    return formattedResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback responses if API fails
    if (interviewType === 'technical') {
      const technicalQuestions = [
        "Could you explain how you would optimize a React application's performance?",
        "What's your approach to handling state management in large applications?",
        "How do you implement error boundaries and handle errors in React?",
        "Explain your experience with RESTful APIs and GraphQL",
        "How would you architect a scalable microservices system?"
      ];
      return technicalQuestions[Math.floor(Math.random() * technicalQuestions.length)];
    } else if (interviewType === 'behavioral') {
      const behavioralQuestions = [
        "Tell me about a time when you had to lead a project with conflicting stakeholder interests",
        "Describe a situation where you had to adapt to a significant change at work",
        "How have you handled disagreements with team members?",
        "What's the most challenging feedback you've received and how did you address it?",
        "Share an experience where you had to meet a tight deadline"
      ];
      return behavioralQuestions[Math.floor(Math.random() * behavioralQuestions.length)];
    } else {
      const generalQuestions = [
        "Where do you see yourself in five years?",
        "What interests you most about our company culture?",
        "How do you stay updated with industry trends?",
        "What's your ideal work environment?",
        "How do you handle work-life balance?"
      ];
      return generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
    }
  }
};

  const startListening = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const downloadTranscript = async (format) => {
    // Generate transcript text
    const transcript = conversation.map(item => 
      `${item.role === 'interviewer' ? 'Interviewer' : 'You'}: ${item.content}`
    ).join('\n\n');
    
    if (format === 'pdf') {
      // Generate PDF using pdf-lib
      const { PDFDocument, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText(`Interview Preparation Transcript\n\n${transcript}`, {
        x: 50,
        y: page.getHeight() - 50,
        size: 12,
        font,
        maxWidth: page.getWidth() - 100,
        lineHeight: 18,
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'interview_transcript.pdf';
      link.click();
    } else {
      // Generate DOCX using docx
      const { Document, Paragraph, TextRun, Packer } = await import('docx');
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Interview Preparation Transcript',
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            ...transcript.split('\n\n').map(text => 
              new Paragraph({
                children: [new TextRun(text)],
                spacing: { after: 200 },
              })
            ),
          ],
        }],
      });
      
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'interview_transcript.docx';
      link.click();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Interview Preparation Assistant</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Interview Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={startInterview} disabled={isSpeaking || loading}>
              Start Interview
            </Button>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="border rounded-lg p-4 h-64 overflow-y-auto">
            {conversation.length === 0 ? (
              <p className="text-gray-500">The interview will appear here...</p>
            ) : (
              conversation.map((item, index) => (
                <div key={index} className={`mb-4 ${item.role === 'interviewer' ? 'text-primary' : 'text-secondary'}`}>
                  <strong>{item.role === 'interviewer' ? 'Interviewer' : 'You'}:</strong>
                  <p>{item.content}</p>
                </div>
              ))
            )}
            {loading && <p className="text-gray-500">Interviewer is thinking...</p>}
          </div>
          
          {feedback && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700">{feedback}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response here..."
              className="flex-1"
            />
            
            <Button 
              variant="outline" 
              onClick={isListening ? stopListening : startListening}
              className="w-12 p-0"
            >
              {isListening ? <StopCircle /> : <Mic />}
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              onClick={() => downloadTranscript('pdf')} 
              variant="outline"
              disabled={conversation.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button 
              onClick={() => downloadTranscript('docx')} 
              variant="outline"
              disabled={conversation.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> DOCX
            </Button>
          </div>
          
          <Button 
            onClick={handleUserResponse} 
            disabled={!userInput.trim() || isSpeaking || loading}
          >
            Send Response
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InterviewAssistant;