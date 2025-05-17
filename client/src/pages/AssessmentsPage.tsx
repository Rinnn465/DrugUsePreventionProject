import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, AlertTriangle, InfoIcon } from 'lucide-react';
import { assessmentData } from '../data/assessmentData';

const AssessmentsPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Risk Assessment Tools</h1>
          <p className="text-lg text-gray-600 mb-8">
            Take our questionnaires to evaluate your risk level and receive personalized recommendations.
          </p>

          <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mb-12 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <InfoIcon className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-800 mb-2">About Our Assessment Tools</h3>
                <p className="text-accent-700 mb-4">
                  These standardized surveys help identify potential risk levels and guide appropriate
                  next steps. Your responses are confidential and used only to provide personalized recommendations.
                </p>
                <p className="text-accent-700">
                  <strong>Note:</strong> These tools are not a substitute for professional diagnosis. If you're concerned
                  about substance use, please consult with a healthcare professional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {assessmentData.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-${assessment.color}-100 text-${assessment.color}-600`}>
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
                    <p className="h-[96px] text-gray-600 mb-4">{assessment.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended for:</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.audiences.map((audience, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>{assessment.questionCount} questions</span>
                        <span className="mx-2">•</span>
                        <span>~{assessment.timeToComplete} min</span>
                      </div>
                      <Link
                        to={`/assessments/${assessment.id}`}
                        className={`bg-primary-600 text-white font-medium py-2 px-4 rounded hover:bg-${assessment.color}-700 transition-colors`}
                      >
                        Start Assessment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 p-6 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-warning-800 mb-2">Need Immediate Help?</h3>
              <p className="text-warning-700 mb-4">
                If you or someone you know is experiencing a substance use emergency or mental health crisis,
                please contact emergency services or a helpline immediately.
              </p>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">National Helplines:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>Substance Abuse and Mental Health Services Administration (SAMHSA): 1-800-662-HELP (4357)</li>
                  <li>National Suicide Prevention Lifeline: 1-800-273-TALK (8255)</li>
                  <li>Crisis Text Line: Text HOME to 741741</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsPage;