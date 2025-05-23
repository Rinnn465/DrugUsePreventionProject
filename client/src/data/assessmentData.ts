import { Assessment } from '../types/Assessment';

export const assessmentData: Assessment[] = [
  {
    id: 1,
    title: "ASSIST Screening Tool",
    description: "The Alcohol, Smoking and Substance Involvement Screening Test (ASSIST) helps identify substance use patterns and related risks.",
    questionCount: 8,
    timeToComplete: 5,
    audiences: ["Adults", "Young Adults", "Teenagers"],
    color: "primary",
    questions: [
      {
        id: 1,
        text: "In your life, which of the following substances have you ever used? (Non-medical use only)",
        type: "checkbox",
        options: [
          { id: "a", text: "Tobacco products", value: 0 },
          { id: "b", text: "Alcoholic beverages", value: 1 },
          { id: "c", text: "Cannabis", value: 2 },
          { id: "d", text: "Cocaine", value: 3 },
          { id: "e", text: "Amphetamine type stimulants", value: 4 },
          { id: "f", text: "Inhalants", value: 5 },
          { id: "g", text: "Sedatives or sleeping pills", value: 6 },
          { id: "h", text: "Hallucinogens", value: 7 },
          { id: "i", text: "Opioids", value: 8 },
        ]
      },
      // Additional questions would be added here
      {
        id: 2,
        text: "In the past three months, how often have you used the substances you mentioned?",
        options: [
          { id: "aa", text: "Never", value: 0 },
          { id: "bb", text: "Once or twice", value: 2 },
          { id: "cc", text: "Monthly", value: 3 },
          { id: "dd", text: "Weekly", value: 4 },
          { id: "ee", text: "Daily or almost daily", value: 6 }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "CRAFFT Screening",
    description: "A brief screening tool for adolescents to assess risk levels related to alcohol and other drugs.",
    questionCount: 6,
    timeToComplete: 3,
    audiences: ["Teenagers", "Young Adults"],
    color: "secondary",
    questions: [
      {
        id: 1,
        text: "Have you ever ridden in a CAR driven by someone (including yourself) who was 'high' or had been using alcohol or drugs?",
        options: [
          { id: "a", text: "No", value: 0 },
          { id: "b", text: "Yes", value: 1 }
        ]
      },
      {
        id: 2,
        text: "Do you ever use alcohol or drugs to RELAX, feel better about yourself, or fit in?",
        options: [
          { id: "a", text: "No", value: 0 },
          { id: "b", text: "Yes", value: 1 }
        ]
      },
      // Additional questions would be added here
    ]
  },
  {
    id: 3,
    title: "Parental Risk Assessment",
    description: "Helps parents evaluate potential risk factors in their family environment and parenting approach.",
    questionCount: 15,
    timeToComplete: 8,
    audiences: ["Parents", "Guardians"],
    color: "accent",
    questions: [
      {
        id: 1,
        text: "How would you rate your family's communication about the risks of substance use?",
        options: [
          { id: "a", text: "We discuss this topic openly and regularly", value: 0 },
          { id: "b", text: "We occasionally discuss this topic", value: 1 },
          { id: "c", text: "We rarely discuss this topic", value: 2 },
          { id: "d", text: "We never discuss this topic", value: 3 }
        ]
      },
      // Additional questions would be added here
    ]
  },
  {
    id: 4,
    title: "School Environment Assessment",
    description: "For educators to evaluate their school's prevention environment and identify areas for improvement.",
    questionCount: 20,
    timeToComplete: 10,
    audiences: ["Teachers", "School Administrators"],
    color: "success",
    questions: [
      {
        id: 1,
        text: "Does your school have a comprehensive substance use prevention curriculum?",
        options: [
          { id: "a", text: "Yes, well-implemented", value: 0 },
          { id: "b", text: "Yes, but implementation could be improved", value: 1 },
          { id: "c", text: "Only minimal or outdated curriculum", value: 2 },
          { id: "d", text: "No prevention curriculum", value: 3 }
        ]
      },
      // Additional questions would be added here
    ]
  }
];