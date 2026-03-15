import React, { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  placeholder: string;
  helpText?: string;
}

interface GuidedQuestionnaireProps {
  qiCode: string;
  qiText: string;
  onResponseGenerated: (response: string) => void;
  existingResponse?: string;
}

// Question bank for Core Module QIs (sample - 5 QIs)
const questionBank: Record<string, Question[]> = {
  'CORE-01-01': [
    {
      id: 1,
      question: "How do you find out what each participant wants and needs?",
      placeholder: "We talk to participants during initial meetings and regular check-ins...",
      helpText: "Describe your process for understanding individual preferences"
    },
    {
      id: 2,
      question: "How do you make sure participants' choices are respected?",
      placeholder: "We document their preferences in their support plan and review...",
      helpText: "Explain how you honor participant decisions"
    },
    {
      id: 3,
      question: "What do you do if a participant changes their mind?",
      placeholder: "We update their support plan immediately and communicate...",
      helpText: "Describe your process for handling changes"
    }
  ],
  'CORE-01-02': [
    {
      id: 1,
      question: "How do you learn about each participant's background and culture?",
      placeholder: "During onboarding, we ask about their cultural background...",
      helpText: "Describe cultural assessment process"
    },
    {
      id: 2,
      question: "How do staff respect different values and beliefs?",
      placeholder: "Staff receive cultural competency training and...",
      helpText: "Explain staff training and practices"
    },
    {
      id: 3,
      question: "Can you give an example of how you've adapted to someone's cultural needs?",
      placeholder: "For one participant who observes Ramadan, we adjusted...",
      helpText: "Provide a specific example"
    }
  ],
  'CORE-02-01': [
    {
      id: 1,
      question: "Who makes decisions in your organization and how?",
      placeholder: "The Director makes strategic decisions with input from...",
      helpText: "Describe governance structure"
    },
    {
      id: 2,
      question: "How do you ensure decisions are in participants' best interests?",
      placeholder: "We have a participant advisory group that reviews...",
      helpText: "Explain participant involvement"
    },
    {
      id: 3,
      question: "How do you handle conflicts of interest?",
      placeholder: "Staff declare conflicts annually and we have a policy...",
      helpText: "Describe conflict management"
    }
  ],
  'VER-01-01': [
    {
      id: 1,
      question: "How do you recruit staff?",
      placeholder: "We advertise positions, conduct interviews, and check...",
      helpText: "Describe recruitment process"
    },
    {
      id: 2,
      question: "What checks do you do before hiring someone?",
      placeholder: "We conduct police checks, reference checks, and...",
      helpText: "List pre-employment checks"
    },
    {
      id: 3,
      question: "How do you train new staff?",
      placeholder: "New staff complete a 2-week induction covering...",
      helpText: "Describe onboarding and training"
    }
  ],
  'VER-02-01': [
    {
      id: 1,
      question: "What types of incidents do you record?",
      placeholder: "We record all incidents including injuries, medication errors...",
      helpText: "List incident categories"
    },
    {
      id: 2,
      question: "How do staff report incidents?",
      placeholder: "Staff complete an incident form within 2 hours and notify...",
      helpText: "Describe reporting process"
    },
    {
      id: 3,
      question: "What do you do after an incident is reported?",
      placeholder: "Management reviews within 24 hours, investigates root cause...",
      helpText: "Explain follow-up process"
    }
  ]
};

// Default questions for QIs not in bank
const defaultQuestions: Question[] = [
  {
    id: 1,
    question: "What policies or procedures do you have for this area?",
    placeholder: "We have a policy that covers...",
    helpText: "Reference your relevant policies"
  },
  {
    id: 2,
    question: "How do staff implement these policies in practice?",
    placeholder: "Staff are trained to...",
    helpText: "Describe practical implementation"
  },
  {
    id: 3,
    question: "How do you monitor and review this area?",
    placeholder: "We review quarterly through...",
    helpText: "Explain monitoring process"
  },
  {
    id: 4,
    question: "What evidence can you provide to support your response?",
    placeholder: "We can provide policy documents, training records...",
    helpText: "List supporting evidence"
  }
];

export const GuidedQuestionnaire: React.FC<GuidedQuestionnaireProps> = ({
  qiCode,
  qiText,
  onResponseGenerated,
  existingResponse
}) => {
  const questions = questionBank[qiCode] || defaultQuestions;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generatedResponse, setGeneratedResponse] = useState(existingResponse || '');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const generateResponse = () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const response = assembleResponse(qiCode, qiText, questions, answers);
      setGeneratedResponse(response);
      setShowPreview(true);
      setIsGenerating(false);
    }, 1500);
  };

  const handleUseResponse = () => {
    onResponseGenerated(generatedResponse);
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  if (showPreview) {
    return (
      <div className="space-y-6">
        <GlassCard variant="frosted" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Generated Response</h3>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
            <textarea
              value={generatedResponse}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGeneratedResponse(e.target.value)}
              className="w-full h-64 p-3 bg-transparent border-0 resize-none focus:ring-0 text-sm leading-relaxed"
              placeholder="Generated response will appear here..."
            />
          </div>

          <div className="flex gap-3">
            <GlassButton onClick={handleUseResponse} variant="primary">
              Use This Response
            </GlassButton>
            <GlassButton onClick={() => setShowPreview(false)} variant="outline">
              Edit Answers
            </GlassButton>
          </div>
        </GlassCard>

        <div className="text-sm text-slate-500">
          <p>💡 Tip: You can edit the generated response above before using it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-slate-500">
          {currentStep + 1} of {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <GlassCard variant="frosted" padding="lg">
        <div className="mb-6">
          <span className="text-xs font-medium text-indigo-500 uppercase tracking-wide">
            Question {currentStep + 1} of {questions.length}
          </span>
          <h3 className="text-lg font-semibold mt-2 text-slate-900 dark:text-slate-100">
            {currentQuestion.question}
          </h3>
          {currentQuestion.helpText && (
            <p className="text-sm text-slate-500 mt-2">
              {currentQuestion.helpText}
            </p>
          )}
        </div>

        <textarea
          value={answers[currentQuestion.id] || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(currentQuestion.id, e.target.value)}
          placeholder={currentQuestion.placeholder}
          className="min-h-[120px] resize-none w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex justify-between mt-6">
          <GlassButton
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            variant="outline"
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </GlassButton>

          {currentStep < questions.length - 1 ? (
            <GlassButton
              onClick={() => setCurrentStep(prev => Math.min(questions.length - 1, prev + 1))}
              variant="primary"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </GlassButton>
          ) : (
            <GlassButton
              onClick={generateResponse}
              variant="primary"
              disabled={isGenerating || Object.keys(answers).length < questions.length}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Response
                </>
              )}
            </GlassButton>
          )}
        </div>
      </GlassCard>

      {/* Tips */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
          💡 Tips for Better Responses
        </h4>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Be specific — use examples from your practice</li>
          <li>• Mention actual policies, procedures, or documents</li>
          <li>• Include timeframes (e.g., "within 24 hours")</li>
          <li>• Reference staff roles and responsibilities</li>
        </ul>
      </div>

      {/* Existing Response Option */}
      {existingResponse && (
        <div className="text-center">
          <button
            onClick={() => onResponseGenerated(existingResponse)}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Keep existing response and exit questionnaire
          </button>
        </div>
      )}
    </div>
  );
};

// AI Assembly Function
function assembleResponse(
  qiCode: string,
  qiText: string,
  questions: Question[],
  answers: Record<number, string>
): string {
  const moduleName = getModuleName(qiCode);
  
  let response = `**${qiCode}: ${qiText}**\n\n`;
  
  response += `Our organization has established comprehensive processes to address this ${moduleName} requirement. `;
  
  // Add each answer as a paragraph
  questions.forEach((q, index) => {
    const answer = answers[q.id];
    if (answer && answer.trim()) {
      // Transform plain answer into formal language
      const formalAnswer = transformToFormal(answer);
      response += `${formalAnswer} `;
      
      // Add transition every 2-3 sentences
      if (index < questions.length - 1) {
        response += `\n\n`;
      }
    }
  });
  
  // Add evidence reference
  response += `\n\n**Evidence:** This practice is supported by our policies and procedures, staff training records, and operational documentation which are available for review during audit.`;
  
  return response.trim();
}

function getModuleName(qiCode: string): string {
  if (qiCode.startsWith('CORE')) return 'Core Module';
  if (qiCode.startsWith('VER')) return 'Verification Module';
  if (qiCode.startsWith('MOD1')) return 'High Intensity Daily Personal Activities';
  if (qiCode.startsWith('MOD2')) return 'Specialist Behaviour Support';
  return 'NDIS Practice Standard';
}

function transformToFormal(answer: string): string {
  // Simple transformations to make language more formal
  let formal = answer.trim();
  
  // Capitalize first letter
  formal = formal.charAt(0).toUpperCase() + formal.slice(1);
  
  // Ensure ending punctuation
  if (!formal.match(/[.!?]$/)) {
    formal += '.';
  }
  
  // Replace casual phrases
  formal = formal.replace(/\bwe do\b/gi, 'we have implemented');
  formal = formal.replace(/\bwe make sure\b/gi, 'we ensure');
  formal = formal.replace(/\bwe check\b/gi, 'we monitor');
  formal = formal.replace(/\bwe talk\b/gi, 'we communicate');
  
  return formal;
}

export default GuidedQuestionnaire;
