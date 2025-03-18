
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Brain, User, FileText, ArrowLeft, BarChart2 } from "lucide-react";

// AI detection features to analyze
const AI_FEATURES = [
  { name: "Repetitive patterns", weight: 0.15 },
  { name: "Unusual vocabulary diversity", weight: 0.15 },
  { name: "Overly formal structure", weight: 0.1 },
  { name: "Lack of personal anecdotes", weight: 0.1 },
  { name: "Consistent writing style", weight: 0.1 },
  { name: "Use of rare word combinations", weight: 0.1 },
  { name: "Statistical sentence length variance", weight: 0.1 },
  { name: "Low presence of filler words", weight: 0.1 },
  { name: "Predictable transitions", weight: 0.05 },
  { name: "Reference citation patterns", weight: 0.05 }
];

const AiDetector: React.FC = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    score: number;
    likelihood: string;
    features: Array<{ name: string; present: boolean; confidence: number }>;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate vocabulary diversity (unique words / total words)
  const calculateVocabDiversity = (text: string): number => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    return uniqueWords.size / Math.max(words.length, 1);
  };

  // Calculate sentence length variance
  const calculateSentenceLengthVariance = (text: string): number => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return 0;
    
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    
    // Normalize variance to a 0-1 scale (higher variance = more human-like)
    return Math.min(1, variance / 25);
  };

  // Count common filler words
  const countFillerWords = (text: string): number => {
    const fillerWords = [
      "um", "uh", "like", "actually", "basically", "literally", 
      "you know", "sort of", "kind of", "i mean", "anyway", "so"
    ];
    
    const lowerText = text.toLowerCase();
    let count = 0;
    
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    });
    
    const words = text.split(/\s+/).length;
    return count / Math.max(words, 1);
  };

  // Detect repetitive patterns
  const detectRepetitivePatterns = (text: string): number => {
    // Check for repeated phrases (3+ words)
    const phrases: Record<string, number> = {};
    const words = text.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
    
    const repeatedPhrases = Object.values(phrases).filter(count => count > 1).length;
    const maxPossiblePhrases = Math.max(1, words.length - 2);
    
    return repeatedPhrases / maxPossiblePhrases;
  };

  // Analyze text for AI likelihood
  const analyzeText = () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        // Make sure to define sentences first to prevent reference errors
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Calculate various linguistic features
        const vocabDiversity = calculateVocabDiversity(text);
        const sentenceVariance = calculateSentenceLengthVariance(text);
        const fillerWordRatio = countFillerWords(text);
        const repetitionScore = detectRepetitivePatterns(text);
        
        // More formal texts tend to have higher average word length
        const words = text.match(/\b\w+\b/g) || [];
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1);
        const formalityScore = Math.min(1, avgWordLength / 10);
        
        // First person pronouns indicate personal anecdotes
        const firstPersonCount = (text.toLowerCase().match(/\b(i|me|my|mine|myself)\b/g) || []).length;
        const personalAnecdoteScore = firstPersonCount / Math.max(words.length, 1) * 20;

        // Technical term consistency
        const technicalTerms = /\b(algorithm|data|system|function|process|analysis|framework|methodology|implementation|interface)\b/gi;
        const techTermMatches = text.match(technicalTerms) || [];
        const techTermConsistency = techTermMatches.length / Math.max(words.length, 1) * 10;
        
        // Predictable transitions
        const transitions = /\b(however|therefore|furthermore|consequently|thus|moreover|additionally|in conclusion|as a result)\b/gi;
        const transitionMatches = text.match(transitions) || [];
        const transitionScore = transitionMatches.length / Math.max(sentences.length, 1);

        // Analyze features with confidence scores
        const featureAnalysis = [
          { 
            name: "Repetitive patterns", 
            present: repetitionScore > 0.1,
            confidence: repetitionScore * 100 
          },
          { 
            name: "Unusual vocabulary diversity", 
            present: vocabDiversity > 0.7 || vocabDiversity < 0.4,
            confidence: Math.abs(vocabDiversity - 0.55) * 200 
          },
          { 
            name: "Overly formal structure", 
            present: formalityScore > 0.65,
            confidence: formalityScore * 100 
          },
          { 
            name: "Lack of personal anecdotes", 
            present: personalAnecdoteScore < 0.2,
            confidence: (1 - personalAnecdoteScore) * 100 
          },
          { 
            name: "Statistical sentence length variance", 
            present: sentenceVariance < 0.4,
            confidence: (1 - sentenceVariance) * 100 
          },
          { 
            name: "Low presence of filler words", 
            present: fillerWordRatio < 0.01,
            confidence: Math.max(0, (1 - (fillerWordRatio * 100))) 
          },
          {
            name: "Predictable transitions",
            present: transitionScore > 0.2,
            confidence: transitionScore * 100
          },
          {
            name: "Technical term consistency",
            present: techTermConsistency > 0.3,
            confidence: techTermConsistency * 100
          }
        ];
        
        // Calculate weighted AI score (0-100)
        let aiScore = 0;
        featureAnalysis.forEach(feature => {
          const weight = AI_FEATURES.find(f => f.name === feature.name)?.weight || 0.1;
          if (feature.present) {
            aiScore += (feature.confidence / 100) * weight * 100;
          }
        });
        
        // Determine likelihood category
        let likelihood;
        if (aiScore >= 75) likelihood = "Very likely AI-generated";
        else if (aiScore >= 60) likelihood = "Likely AI-generated";
        else if (aiScore >= 40) likelihood = "Possibly AI-generated";
        else if (aiScore >= 25) likelihood = "Likely human-written";
        else likelihood = "Very likely human-written";
        
        setResult({
          score: Math.min(100, Math.max(0, aiScore)),
          likelihood,
          features: featureAnalysis
        });
      } catch (err) {
        setError("An error occurred during analysis. Please try again.");
        console.error("Analysis error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  // Reset the analysis
  const resetAnalysis = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-800 relative">
                Detectify
                <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-gradient-to-r from-purple-600 to-transparent"></span>
              </h1>
              <p className="text-gray-600 mt-2">AI Text Detection</p>
            </div>
            <Link 
              to="/" 
              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors hover:scale-105 transform duration-200 bg-purple-50 px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Similarity Scanner
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-800">
            <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
            Analyze Text
          </h2>
          <p className="text-gray-600 mb-6 border-l-4 border-purple-200 pl-3">
            Paste any text below to determine if it was likely written by AI or a human.
          </p>
          
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here (minimum 100 characters recommended for accurate results)"
              className="h-48 focus:border-purple-300 focus:ring-purple-300"
            />
            
            {error && (
              <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-md border-l-4 border-red-500 animate-fade-in">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={analyzeText}
                disabled={isAnalyzing || !text.trim()}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-800 text-white font-medium rounded-md hover:from-purple-800 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Text"
                )}
              </button>
              
              {(text.trim() || result) && (
                <button
                  onClick={resetAnalysis}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-all duration-300 hover:border-purple-300 hover:text-purple-600"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Analysis Results</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium">{result.likelihood}</span>
                <span className="text-sm font-medium">
                  {result.score > 50 ? (
                    <span className="flex items-center text-purple-600"><Brain className="h-4 w-4 mr-1" /> AI Indicators</span>
                  ) : (
                    <span className="flex items-center text-green-600"><User className="h-4 w-4 mr-1" /> Human Indicators</span>
                  )}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                    result.score >= 75 ? "bg-gradient-to-r from-red-500 to-red-600" : 
                    result.score >= 50 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : 
                    "bg-gradient-to-r from-green-500 to-green-600"
                  }`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-1 text-sm text-gray-600">
                <span>Human</span>
                <span>AI</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-purple-700">Analysis Factors</h3>
              <div className="space-y-3 transition-all duration-300">
                {result.features.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center text-sm transition-all duration-300 hover:bg-purple-50 p-2 rounded-md">
                    <span className={feature.present ? "text-purple-700 font-medium" : "text-gray-600"}>
                      {feature.name}
                    </span>
                    <span className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${feature.present ? "bg-purple-600" : "bg-gray-400"}`}
                          style={{ width: `${feature.present ? feature.confidence : 100 - feature.confidence}%` }}
                        ></div>
                      </div>
                      {feature.present ? (
                        <span className="text-xs font-medium text-purple-700 w-8 text-right">
                          {Math.round(feature.confidence)}%
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-700 w-8 text-right">
                          No
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600">
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-purple-600" />
                <p>
                  <strong>Disclaimer:</strong> This analysis is based on linguistic patterns and 
                  statistical methods. It provides an indication but is not definitive proof of AI or 
                  human authorship. The technology for AI text generation is constantly evolving, making 
                  detection increasingly challenging.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* How It Works Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 transition-all duration-300 hover:shadow-xl animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-purple-800">How It Works</h2>
          <p className="text-gray-600 mb-4 border-l-4 border-purple-200 pl-3">
            Our AI text detector analyzes linguistic patterns and statistical features that often differentiate 
            between human and AI-generated content:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {AI_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-purple-50 hover:scale-105 transform">
                <div className="bg-purple-100 rounded-full p-2 mr-3 flex-shrink-0">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{feature.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {index % 2 === 0 ? 
                      "AI often exhibits patterns that differ from typical human writing variation." :
                      "This feature helps identify statistical anomalies in text structure and complexity."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="animate-fade-in">Detectify - AI Text Detection &copy; {new Date().getFullYear()}</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-purple-500 hover:text-purple-700 transition-colors">Privacy Policy</a>
            <a href="#" className="text-purple-500 hover:text-purple-700 transition-colors">Terms of Service</a>
            <a href="#" className="text-purple-500 hover:text-purple-700 transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AiDetector;
