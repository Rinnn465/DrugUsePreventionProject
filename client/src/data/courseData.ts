import { Course } from '../types/Course';

export const courseData: Course[] = [
  {
    id: 1,
    title: "Drug Awareness for Teenagers",
    description: "Learn about the risks of drug use, common substances, and effective ways to resist peer pressure.",
    category: "Education",
    audience: "Students",
    duration: "4 hours",
    enrolledCount: 2456,
    isCertified: true,
    risk: 'high',
    imageUrl: "https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Understanding Substance Types", duration: "45 min" },
      { id: 2, title: "Identifying Risk Factors", duration: "45 min" },
      { id: 3, title: "Developing Refusal Skills", duration: "60 min" },
      { id: 4, title: "Building Healthy Alternatives", duration: "45 min" },
      { id: 5, title: "Final Assessment", duration: "30 min" }
    ]
  },
  {
    id: 2,
    title: "Prevention Strategies for Parents",
    description: "A course designed to help parents understand warning signs and have effective conversations about drugs with their children.",
    category: "Prevention",
    audience: "Parents",
    duration: "6 hours",
    enrolledCount: 1839,
    isCertified: true,
    risk: 'low',
    imageUrl: "https://images.pexels.com/photos/7282588/pexels-photo-7282588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Understanding Adolescent Development", duration: "60 min" },
      { id: 2, title: "Risk and Protective Factors", duration: "45 min" },
      { id: 3, title: "Communication Strategies", duration: "90 min" },
      { id: 4, title: "Setting Boundaries", duration: "60 min" },
      { id: 5, title: "Recognizing Warning Signs", duration: "60 min" },
      { id: 6, title: "Final Assessment", duration: "30 min" }
    ]
  },
  {
    id: 3,
    title: "Classroom Prevention Techniques",
    description: "Equip teachers with tools and methods to address drug prevention and promote healthy decision-making in the classroom.",
    category: "Education",
    audience: "Teachers",
    duration: "8 hours",
    enrolledCount: 1245,
    isCertified: true,
    risk: 'medium',
    imageUrl: "https://images.pexels.com/photos/5212703/pexels-photo-5212703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Creating a Supportive Classroom Environment", duration: "60 min" },
      { id: 2, title: "Age-Appropriate Prevention Strategies", duration: "90 min" },
      { id: 3, title: "Integrating Prevention into Curriculum", duration: "90 min" },
      { id: 4, title: "Identifying At-Risk Students", duration: "60 min" },
      { id: 5, title: "Intervention Techniques", duration: "120 min" },
      { id: 6, title: "Final Assessment and Certification", duration: "60 min" }
    ]
  },
  {
    id: 4,
    title: "Resilience Building for Youth",
    description: "Learn techniques to build resilience in children and teenagers, a key protective factor against substance abuse.",
    category: "Prevention",
    audience: "Students",
    duration: "3 hours",
    enrolledCount: 978,
    isCertified: false,
    risk: 'low',
    imageUrl: "https://images.pexels.com/photos/6382633/pexels-photo-6382633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Understanding Resilience", duration: "45 min" },
      { id: 2, title: "Self-Regulation Techniques", duration: "45 min" },
      { id: 3, title: "Building Positive Relationships", duration: "45 min" },
      { id: 4, title: "Coping with Stress", duration: "45 min" }
    ]
  },
  {
    id: 5,
    title: "Peer Facilitation Training",
    description: "Train students to become peer facilitators who can lead prevention discussions and support fellow students.",
    category: "Leadership",
    audience: "Students",
    duration: "5 hours",
    enrolledCount: 756,
    isCertified: true,
    risk: 'high',
    imageUrl: "https://images.pexels.com/photos/8363020/pexels-photo-8363020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "The Role of a Peer Facilitator", duration: "45 min" },
      { id: 2, title: "Communication and Listening Skills", duration: "60 min" },
      { id: 3, title: "Leading Group Discussions", duration: "60 min" },
      { id: 4, title: "Recognizing Warning Signs", duration: "45 min" },
      { id: 5, title: "Supporting Peers in Need", duration: "60 min" },
      { id: 6, title: "Practical Facilitation Exercise", duration: "30 min" }
    ]
  },
  {
    id: 6,
    title: "Community Prevention Strategies",
    description: "A comprehensive course for community leaders on developing and implementing effective prevention programs.",
    category: "Leadership",
    audience: "Community",
    duration: "10 hours",
    enrolledCount: 542,
    isCertified: true,
    risk: 'high',
    imageUrl: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Assessing Community Needs", duration: "90 min" },
      { id: 2, title: "Evidence-Based Prevention Models", duration: "120 min" },
      { id: 3, title: "Building Community Coalitions", duration: "90 min" },
      { id: 4, title: "Creating Sustainable Programs", duration: "120 min" },
      { id: 5, title: "Measuring Program Effectiveness", duration: "90 min" },
      { id: 6, title: "Funding and Resource Development", duration: "90 min" }
    ]
  }
];