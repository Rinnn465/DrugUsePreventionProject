import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Field, Form, FormikProps } from 'formik';
import * as Yup from 'yup';

import { assessmentData } from '../../data/assessmentData';
import { SqlCourse } from '../../types/Course';
import { Assessment } from '../../types/Assessment';
import { useUser } from '@/context/UserContext';

type FormValues = {
  [key: string]: string | string[];
};

type GroupedConsultant = {
  AccountID: number;
  Name: string;
  Bio: string;
  Title: string;
  ImageUrl: string;
  IsDisabled: boolean;
  Categories: Array<{
    CategoryID: number;
    CategoryName: string;
  }>;
};

type NavigationButtonsProps = {
  currentIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrev: () => void;
  assessment: Assessment;
  formikProps: FormikProps<FormValues>;
};

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentIndex,
  totalQuestions,
  onNext,
  onPrev,
  assessment,
  formikProps
}) => {
  const { values, errors, touched } = formikProps;
  const currentQuestion = assessment.questions[currentIndex];

  const isCurrentQuestionAnswered = () => {
    const answer = values[currentQuestion.id];
    if (currentQuestion.type === 'checkbox') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return Boolean(answer && answer !== '');
  };

  const validateCurrentQuestion = () => {
    if (!isCurrentQuestionAnswered()) {
      const message = currentQuestion.type === 'checkbox' ? 'Chọn ít nhất một lựa chọn' : 'Không được để trống';
      return message;
    }
    return null;
  };

  const handleNextClick = () => {
    const validationError = validateCurrentQuestion();
    if (validationError) {
      formikProps.setFieldError(currentQuestion.id, validationError);
      formikProps.setFieldTouched(currentQuestion.id, true);
    } else {
      formikProps.setFieldError(currentQuestion.id, undefined);
      onNext();
    }
  };


  return (
    <div className="flex justify-between items-center mt-6">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${currentIndex === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white hover:from-gray-600 hover:to-gray-500'
          }`}
      >
        ← Quay lại
      </button>

      {currentIndex < totalQuestions - 1 ? (
        <button
          type="button"
          onClick={handleNextClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg"
        >
          Tiếp theo →
        </button>
      ) : (
        <button
          className='px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg'
          type='button'
          onClick={() => {
            const validationError = validateCurrentQuestion();
            if (validationError) {
              formikProps.setFieldError(currentQuestion.id, validationError);
              formikProps.setFieldTouched(currentQuestion.id, true);
            } else {
              formikProps.setFieldError(currentQuestion.id, undefined);
              formikProps.submitForm();
            }
          }}
        >
          Hoàn thành đánh giá
        </button>
      )}
    </div>
  );
};

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjgiIGN5PSIyOCIgcj0iMjgiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNiIgeT0iMTYiPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo8L3N2Zz4K';

const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { user } = useUser();
  const assessment = assessmentData[Number(assessmentId) - 1];
  const [result, setResult] = useState<number | null>(-1);
  const [risk, setRisk] = useState<string>('thấp');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [hasViewedResult, setHasViewedResult] = useState<boolean>(false);
  const [courses, setCourses] = useState<SqlCourse[]>([]);
  const [consultants, setConsultants] = useState<GroupedConsultant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isAuthorized = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      // Sử dụng atob để decode phần payload của JWT (không verify signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRoleName = payload.user?.RoleName;
      if (!userRoleName) return false;
      return ['Consultant', 'Admin'].includes(userRoleName);
    } catch (err) {
      return false;
    }
  };

  const handleQuestionChange = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const initialValues: FormValues = assessment.questions.reduce((acc, q) => {
    acc[q.id] = q.type === 'checkbox' ? [] : '';
    return acc;
  }, {} as FormValues);

  const validationSchema = Yup.object(
    assessment.questions.reduce((acc, q) => {
      acc[q.id] = q.type === 'checkbox'
        ? Yup.array().min(1, 'Chọn ít nhất một lựa chọn')
        : Yup.string().required('Không được để trống');
      return acc;
    }, {} as { [key: string]: Yup.Schema<any> })
  );

  const calculateScore = (formValues: FormValues) => {
    let total = 0;
    console.log('=== CALCULATING SCORE ===');
    console.log('Form values:', formValues);

    if (assessment.id === 1) {
      for (const question of assessment.questions) {
        const answer = formValues[question.id];
        if (typeof answer === 'string') {
          const score = Number(answer);
          console.log(`ASSIST Q${question.id}:`, score);
          total += score;
        }
      }
      return total;
    }

    if (assessment.id === 2) {
      let craftScore = 0;
      for (const question of assessment.questions) {
        const answer = formValues[question.id];
        if (typeof answer === 'string') {
          const score = Number(answer);
          console.log(`CRAFFT Q${question.id}:`, score);
          craftScore += score;
        }
      }
      return craftScore;
    }

    if (assessment.id === 3) {
      let parentScore = 0;
      const maxScores: { [key: string]: number } = {
        'q1': 2,
        'q2': 3,
        'q3': 2,
        'q4': 2,
        'q5': 2,
        'q6': 2,
        'q7': 2,
        'q8': 2
      };
      for (const question of assessment.questions) {
        const answer = formValues[question.id];
        if (typeof answer === 'string') {
          const score = Number(answer);
          const maxScore = maxScores[question.id];
          const percentageScore = (score / maxScore) * 100;
          parentScore += percentageScore;
          console.log(`Parent Q${question.id} (${score}/${maxScore}):`, percentageScore);
        }
      }
      parentScore = parentScore / assessment.questions.length;
      return Math.round(parentScore);
    }

    if (assessment.id === 4) {
      let schoolScore = 0;
      let totalQuestions = 0;
      for (const question of assessment.questions) {
        const answer = formValues[question.id];
        if (typeof answer === 'string') {
          const score = Number(answer);
          const reversedScore = 3 - score;
          schoolScore += reversedScore;
          totalQuestions++;
          console.log(`School Q${question.id} (reversed):`, reversedScore);
        }
      }
      const effectivenessScore = (schoolScore / (totalQuestions * 3)) * 100;
      return Math.round(effectivenessScore);
    }

    return total;
  };

  const handleSubmit = async (values: typeof initialValues) => {
    console.log('=== FORM SUBMISSION ===');
    console.log('Form values:', values);

    let hasErrors = false;
    const errors: { [key: string]: string } = {};

    assessment.questions.forEach(question => {
      const answer = values[question.id];
      let isAnswered = false;

      console.log(`Validating Q${question.id}:`, answer);
      if (question.type === 'checkbox') {
        isAnswered = Array.isArray(answer) && answer.length > 0;
        if (!isAnswered) {
          errors[question.id] = 'Chọn ít nhất một lựa chọn';
          hasErrors = true;
        }
      } else {
        isAnswered = answer !== undefined && answer !== null && answer !== '';
        if (!isAnswered) {
          errors[question.id] = 'Không được để trống';
          hasErrors = true;
        }
      }
      console.log(`Q${question.id} answered:`, isAnswered);
    });

    if (hasErrors) {
      console.log('Validation errors found:', errors);
      const firstErrorQuestion = assessment.questions.findIndex(q => errors[q.id]);
      if (firstErrorQuestion !== -1) {
        setCurrentQuestionIndex(firstErrorQuestion);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const total = calculateScore(values);

    let riskLevel = '';
    switch (assessment.id) {
      case 1: // ASSIST
        riskLevel = total > 26 ? 'cao' : total >= 4 ? 'trung bình' : 'thấp';
        break;
      case 2: // CRAFFT
        riskLevel = total >= 4 ? 'cao' : total >= 2 ? 'trung bình' : 'thấp';
        break;
      case 3: // Parent Assessment
        riskLevel = total < 50 ? 'cao' : total < 75 ? 'trung bình' : 'thấp';
        break;
      case 4: // School Assessment
        riskLevel = total < 60 ? 'cao' : total < 80 ? 'trung bình' : 'thấp';
        break;
      default:
        riskLevel = 'không xác định';
    }

    try {
      const accountId = user?.AccountID;
      const resultData = {
        account_id: accountId,
        assessment_id: Number(assessmentId),
        score: total,
        risk_level: riskLevel,
      };

      console.log('=== GỬI YÊU CẦU POST ===');
      console.log('URL:', 'http://localhost:5000/api/assessment/assessment-results'); // Đã sửa
      console.log('Dữ liệu gửi:', JSON.stringify(resultData, null, 2));
      console.log('Token used:', localStorage.getItem('token')); // Thêm log token

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/assessment/assessment-results', { // Đã sửa
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
      });

      console.log('=== PHẢN HỒI TỪ POST ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phản hồi lỗi:', errorText);
        throw new Error(`Lỗi khi gửi kết quả: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Dữ liệu phản hồi:', JSON.stringify(responseData, null, 2));

      if (!responseData.message || !responseData.id) {
        throw new Error('Phản hồi từ server không hợp lệ');
      }

      localStorage.setItem(`assessmentResult_${assessmentId}`, JSON.stringify({
        total,
        risk: riskLevel,
        timestamp: new Date().toISOString(),
      }));

      setResult(total);
      setRisk(riskLevel);
      setHasViewedResult(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Lỗi chi tiết:', error);
      alert(`Không thể lưu kết quả: ${error.message}\nKiểm tra console log để biết thêm chi tiết.`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedResult = localStorage.getItem(`assessmentResult_${assessmentId}`);
    if (storedResult) {
      const parsedResult = JSON.parse(storedResult);
      setResult(parsedResult.total);
      setRisk(parsedResult.risk);
      setHasViewedResult(true);
    }
  }, [assessmentId]);

  const fetchResultIfAuthorized = async () => {
    if (!user) {
      console.log('fetchResultIfAuthorized: user is null, skip fetch');
      return;
    }
    const token = localStorage.getItem('token');
    console.log('fetchResultIfAuthorized: token =', token);
    console.log('fetchResultIfAuthorized: user =', user);
    try {
      const response = await fetch(`http://localhost:5000/api/assessment/assessment-results/by-assessment/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('fetchResultIfAuthorized: response status =', response.status);
      const resultData = await response.json();
      console.log('fetchResultIfAuthorized: response data =', resultData);
      if (!response.ok) throw new Error(resultData?.error || 'Failed to fetch assessment result');
      setResult(resultData.data.score);
      setRisk(resultData.data.risk_level);
    } catch (error) {
      console.error('Error fetching result:', error);
      setResult(-1);
      setRisk('thấp');
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchResultIfAuthorized();
  }, [assessmentId, user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const coursesResponse = await fetch('http://localhost:5000/api/course');
        if (!coursesResponse.ok) throw new Error(`Lỗi khi lấy khóa học: ${coursesResponse.status}`);
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.data || []);

        // Debug: Fetch categories to see what's available
        try {
          const categoriesResponse = await fetch('http://localhost:5000/api/course/category');
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            console.log('=== AVAILABLE CATEGORIES IN DATABASE ===');
            console.log('Categories:', categoriesData.data?.map((cat: any) => cat.CategoryName) || []);
          }
        } catch (catError) {
          console.log('Could not fetch categories:', catError);
        }

        const consultantsResponse = await fetch('http://localhost:5000/api/consultant/category');
        if (!consultantsResponse.ok) throw new Error(`Lỗi khi lấy chuyên viên: ${consultantsResponse.status}`);
        const consultantsData = await consultantsResponse.json();
        const filteredConsultants = (consultantsData.data || []).filter(
          (consultant: GroupedConsultant) => !consultant.IsDisabled
        );
        console.log('Filtered consultants:', filteredConsultants);
        setConsultants(filteredConsultants);
      } catch (error: any) {
        console.error('Lỗi khi lấy dữ liệu:', error.message);
        setCourses([]);
        setConsultants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredCourses = () => {
    console.log('=== COURSE FILTERING DEBUG ===');
    console.log('Current risk:', risk);
    console.log('Assessment audiences:', assessment.audiences);
    console.log('Total courses available:', courses.length);
    console.log('Sample course structure:', courses[0]);

    if (courses.length === 0) {
      console.log('No courses available to filter');
      return [];
    }

    const filtered = courses.filter(course => {
      console.log(`\n--- Filtering course: ${course.CourseName} ---`);
      console.log('Course risk:', course.Risk);
      console.log('Course categories:', course.Category?.map(cat => cat.CategoryName) || []);

      const riskMatches = course.Risk === risk;
      console.log('Risk matches:', riskMatches, `(${course.Risk} === ${risk})`);

      const audienceMatches = assessment.audiences.some(audience =>
        course.Category?.some(category => {
          const audienceNormalized = audience.toLowerCase().trim();
          const categoryNormalized = category.CategoryName.toLowerCase().trim();

          console.log(`  Comparing audience "${audienceNormalized}" with category "${categoryNormalized}"`);

          const exactMatch = audienceNormalized === categoryNormalized;
          const audienceContainsCategory = audienceNormalized.includes(categoryNormalized);
          const categoryContainsAudience = categoryNormalized.includes(audienceNormalized);

          // Additional flexible matching
          const flexibleMatches = (
            (audienceNormalized === 'học sinh' && categoryNormalized.includes('sinh viên')) ||
            (audienceNormalized === 'sinh viên' && categoryNormalized.includes('học sinh')) ||
            (audienceNormalized === 'người lớn' && (categoryNormalized.includes('phụ huynh') || categoryNormalized.includes('cộng đồng'))) ||
            (audienceNormalized.includes('giáo viên') && categoryNormalized.includes('giáo viên'))
          );

          const matches = exactMatch || audienceContainsCategory || categoryContainsAudience || flexibleMatches;

          if (matches) {
            console.log(`  ✅ CATEGORY MATCH: ${matches} (flexible: ${flexibleMatches})`);
          }

          return matches;
        }) || false
      );

      console.log('Audience matches:', audienceMatches);

      const shouldInclude = riskMatches && audienceMatches;
      console.log(`Final result for ${course.CourseName}:`, shouldInclude ? '✅ INCLUDED' : '❌ EXCLUDED');

      return shouldInclude;
    });

    console.log(`\n=== COURSE FILTERING COMPLETE ===`);
    console.log(`Filtered courses count: ${filtered.length}`);
    console.log('Filtered courses:', filtered.map(c => c.CourseName));
    console.log('Assessment ID:', assessment.id, 'Assessment Title:', assessment.title);

    // Fallback: If no courses match, show courses that match at least the risk level
    if (filtered.length === 0) {
      console.log('\n=== NO COURSES MATCHED - TRYING RISK-ONLY FILTER ===');
      const riskOnlyFiltered = courses.filter(course => course.Risk === risk);
      console.log(`Risk-only filtered courses: ${riskOnlyFiltered.length}`);

      if (riskOnlyFiltered.length > 0) {
        console.log('Returning risk-only filtered courses:', riskOnlyFiltered.map(c => c.CourseName));
        return riskOnlyFiltered;
      }

      // Last fallback: show all courses with some logging about the mismatch
      console.log('\n=== NO RISK MATCH EITHER - SHOWING ALL COURSES ===');
      console.log('Available risk levels in courses:', [...new Set(courses.map(c => c.Risk))]);
      console.log('Target risk level:', risk);
      console.log('Available categories in courses:', courses.flatMap(c => c.Category?.map(cat => cat.CategoryName) || []));
      console.log('Target audiences:', assessment.audiences);

      return courses.slice(0, 6); // Show first 6 courses as fallback
    }

    return filtered;
  };

  const getFilteredConsultants = () => {
    console.log('=== CONSULTANT FILTERING DEBUG ===');
    console.log('Assessment audiences:', assessment.audiences);
    console.log('Total consultants available:', consultants.length);

    if (consultants.length === 0) {
      console.log('No consultants available to filter');
      return [];
    }

    console.log('All consultants with categories:', consultants.map(c => ({
      name: c.Name,
      categories: c.Categories?.map(cat => cat.CategoryName) || []
    })));

    const filtered = consultants.filter(consultant => {
      console.log(`\n--- Filtering consultant: ${consultant.Name} ---`);
      console.log('Consultant categories:', consultant.Categories?.map(cat => cat.CategoryName) || []);

      if (!consultant.Categories || consultant.Categories.length === 0) {
        console.log('❌ No categories for this consultant');
        return false;
      }

      const audienceMatches = assessment.audiences.some(audience => {
        console.log(`Checking audience: "${audience}"`);

        return consultant.Categories.some(category => {
          const audienceNormalized = audience.toLowerCase().trim();
          const categoryNormalized = category.CategoryName.toLowerCase().trim();

          console.log(`  Comparing "${audienceNormalized}" with "${categoryNormalized}"`);

          const exactMatch = audienceNormalized === categoryNormalized;
          const audienceContainsCategory = audienceNormalized.includes(categoryNormalized);
          const categoryContainsAudience = categoryNormalized.includes(audienceNormalized);

          const matches = exactMatch || audienceContainsCategory || categoryContainsAudience;

          if (matches) {
            console.log(`  ✅ MATCH FOUND: exact=${exactMatch}, audienceContains=${audienceContainsCategory}, categoryContains=${categoryContainsAudience}`);
          }

          return matches;
        });
      });

      console.log(`Final result for ${consultant.Name}:`, audienceMatches ? '✅ INCLUDED' : '❌ EXCLUDED');
      return audienceMatches;
    });

    console.log(`\n=== CONSULTANT FILTERING COMPLETE ===`);
    console.log(`Filtered consultants count: ${filtered.length}`);
    console.log('Filtered consultants:', filtered.map(c => c.Name));

    return filtered;
  };

  const isAssessmentComplete = (values: { [key: string]: string | string[] }) => {
    console.log('=== CHECKING COMPLETION ===');
    return assessment.questions.every(question => {
      const answer = values[question.id];
      let isComplete = false;

      if (question.type === 'checkbox') {
        isComplete = Array.isArray(answer) && answer.length > 0;
      } else {
        isComplete = answer !== undefined && answer !== null && answer !== '';
      }

      console.log(`Q${question.id} complete:`, isComplete, 'Value:', answer);
      return isComplete;
    });
  };

  const handleRedoAssessment = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/assessment/assessment-results/by-assessment/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete assessment result');
      setResult(-1);
      setRisk('thấp');
      setCurrentQuestionIndex(0);
      setHasViewedResult(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert('Không thể xóa kết quả.');
      console.error('Error deleting assessment result:', error);
    }
  };

  const handleBackToAssessments = () => {
    setHasViewedResult(false);
    window.location.href = '/assessments';
  };

  const filteredCourses = result !== null && result > -1 ? getFilteredCourses() : [];
  const filteredConsultants = result !== null && result > -1 ? getFilteredConsultants() : [];

  return (

    <div className='container mx-auto px-4 py-8'>
      {result === -1 && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}
          validate={(values) => {
            const errors: { [key: string]: string } = {};
            return errors;
          }}
        >
          {(formikProps: FormikProps<FormValues>) => (
            <>
              <Form className='max-w-2xl mx-auto py-8 px-6 bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl border-2 border-accent-100'>
                <div className='text-center mb-8'>
                  <h1 className='text-3xl font-extrabold text-primary-700 mb-2'>
                    {assessment.title}
                  </h1>
                  <p className='text-gray-600 text-lg'>
                    {assessment.description}
                  </p>
                  <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2 text-sm text-gray-600">
                    Câu {currentQuestionIndex + 1} / {assessment.questions.length}
                  </div>
                </div>
                {(() => {
                  const question = assessment.questions[currentQuestionIndex];
                  return (
                    <div className="relative mb-8">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(Math.max(0, currentQuestionIndex - 1))}
                          disabled={currentQuestionIndex === 0}
                          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-lg ${currentQuestionIndex === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white hover:from-gray-600 hover:to-gray-500 hover:scale-110'
                            }`}
                          title="Quay lại"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div
                          aria-labelledby="checkbox-group"
                          key={`${question.id}-${currentQuestionIndex}`}
                          className='flex-1 p-6 bg-white rounded-xl shadow-lg border border-accent-100'
                          style={{ minHeight: '300px' }}
                        >
                          <p className='text-lg font-bold mb-6 text-blue-500'>
                            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mr-3">
                              Câu {currentQuestionIndex + 1}
                            </span>
                            {question.text}
                          </p>
                          <div className="space-y-3">
                            {question.options.map((option) => {
                              return (
                                <label key={option.id} className='flex items-center cursor-pointer hover:bg-accent-50 rounded-lg px-4 py-3 transition-all border border-transparent hover:border-accent-200'>
                                  {question.type === 'checkbox' ? (
                                    <Field
                                      type='checkbox'
                                      name={question.id}
                                      value={String(option.value)}
                                      className='mr-4 accent-accent-500 w-5 h-5'
                                    />
                                  ) : (
                                    <Field
                                      type='radio'
                                      name={question.id}
                                      value={String(option.value)}
                                      className='mr-4 accent-accent-500 w-5 h-5'
                                    />
                                  )}
                                  <span className='font-medium text-blue-500 text-base'>{option.text}</span>
                                </label>
                              )
                            })}
                          </div>
                          {formikProps.errors[question.id] && formikProps.touched[question.id] && (
                            <div className='text-red-500 text-sm mt-4 p-2 bg-red-50 rounded border border-red-200'>
                              {formikProps.errors[question.id]}
                            </div>
                          )}
                        </div>

                        {currentQuestionIndex < assessment.questions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const currentValidationError = (() => {
                                const answer = formikProps.values[question.id];
                                if (question.type === 'checkbox') {
                                  return Array.isArray(answer) && answer.length > 0 ? null : 'Chọn ít nhất một lựa chọn';
                                }
                                return answer && answer !== '' ? null : 'Không được để trống';
                              })();

                              if (currentValidationError) {
                                formikProps.setFieldError(question.id, currentValidationError);
                                formikProps.setFieldTouched(question.id, true);
                                return;
                              }

                              formikProps.setFieldError(question.id, undefined);
                              handleQuestionChange(Math.min(assessment.questions.length - 1, currentQuestionIndex + 1));
                            }}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg hover:scale-110"
                            title="Tiếp theo"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const currentValidationError = (() => {
                                const answer = formikProps.values[question.id];
                                if (question.type === 'checkbox') {
                                  return Array.isArray(answer) && answer.length > 0 ? null : 'Chọn ít nhất một lựa chọn';
                                }
                                return answer && answer !== '' ? null : 'Không được để trống';
                              })();

                              if (currentValidationError) {
                                formikProps.setFieldError(question.id, currentValidationError);
                                formikProps.setFieldTouched(question.id, true);
                                return;
                              }

                              formikProps.setFieldError(question.id, undefined);

                              if (!isAssessmentComplete(formikProps.values)) {
                                alert('Vui lòng trả lời tất cả câu hỏi trước khi hoàn thành đánh giá.');
                                return;
                              }

                              formikProps.submitForm();
                            }}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg hover:scale-110"
                            title="Hoàn thành đánh giá"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </Form>
            </>
          )}
        </Formik>
      )}

      {result !== null && result >= 0 && (
        <div className="my-10 max-w-3xl mx-auto bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl border-2 border-accent-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-accent-700 whitespace-nowrap">
              Kết quả đánh giá
            </h2>
            <div className="flex gap-3 ml-4">
              <button
                onClick={handleBackToAssessments}
                className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 rounded-lg border border-blue-300 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Về trang đánh giá
              </button>
              <button
                onClick={handleRedoAssessment}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 rounded-lg border border-gray-300 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm lại đánh giá
              </button>
              {isAuthorized() && (
                <button
                  onClick={async () => {
                    if (window.confirm('Bạn có chắc muốn xóa kết quả này?')) {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/assessment/assessment-results/${assessmentId}`, {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                        });
                        if (!response.ok) throw new Error('Failed to delete assessment result');
                        setResult(-1);
                        setRisk('thấp');
                        alert('Kết quả đã được xóa.');
                      } catch (error) {
                        console.error('Error deleting result:', error);
                        alert('Không thể xóa kết quả.');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Xóa kết quả
                </button>
              )}
            </div>
          </div>

          <div className="mb-8 flex items-center gap-4">
            {assessment.id <= 2 ? (
              <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold shadow-md
                ${risk === 'cao' ? 'bg-error-100 text-error-700' :
                  risk === 'trung bình' ? 'bg-warning-100 text-warning-700' :
                    'bg-success-100 text-success-700'}`}
              >
                Nguy cơ sử dụng ma túy: {risk.toUpperCase()}
              </span>
            ) : assessment.id === 3 ? (
              <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold shadow-md
                ${risk === 'cần hỗ trợ tích cực' ? 'bg-warning-100 text-warning-700' :
                  risk === 'cần tăng cường' ? 'bg-info-100 text-info-700' :
                    'bg-success-100 text-success-700'}`}
              >
                Mức độ hiệu quả phòng chống: {risk.toUpperCase()}
              </span>
            ) : (
              <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold shadow-md
                ${risk === 'cần tăng cường đáng kể' ? 'bg-warning-100 text-warning-700' :
                  risk === 'cần cải thiện' ? 'bg-info-100 text-info-700' :
                    'bg-success-100 text-success-700'}`}
              >
                Mức độ triển khai phòng chống: {risk.toUpperCase()}
              </span>
            )}
          </div>

          {/* Cảnh báo cho rủi ro cao */}
          {(assessment.id <= 2 && risk === 'cao') && (
            <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-800 mb-2">
                    ⚠️ CẢNH BÁO: Nguy cơ cao cần được tư vấn chuyên môn
                  </h4>
                  <p className="text-red-700 mb-3">
                    Kết quả đánh giá cho thấy bạn đang có nguy cơ cao về sử dụng chất gây nghiện. 
                    <strong> Chúng tôi khuyến nghị bạn nên:</strong>
                  </p>
                  <ul className="text-red-700 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Liên hệ ngay với chuyên viên tư vấn để được hỗ trợ chuyên môn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Tham gia các khóa học phòng ngừa và điều trị</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Chia sẻ với người thân hoặc bạn bè đáng tin cậy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Tìm kiếm sự hỗ trợ từ các tổ chức chuyên môn</span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/appointments"
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Đặt lịch tư vấn ngay
                    </Link>
                    <Link
                      to="/courses"
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Xem khóa học phòng ngừa
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cảnh báo cho rủi ro trung bình */}
          {(assessment.id <= 2 && risk === 'trung bình') && (
            <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-yellow-800 mb-2">
                    ⚠️ LƯU Ý: Cần quan tâm và theo dõi
                  </h4>
                  <p className="text-yellow-700 mb-3">
                    Kết quả đánh giá cho thấy bạn có một số dấu hiệu cần lưu ý. 
                    <strong> Chúng tôi khuyến nghị bạn nên:</strong>
                  </p>
                  <ul className="text-yellow-700 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Tham gia các khóa học phòng ngừa để trang bị kiến thức</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Tham khảo ý kiến chuyên gia để được tư vấn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Xây dựng lối sống lành mạnh và tránh xa các tác nhân gây hại</span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/appointments"
                      className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tư vấn chuyên gia
                    </Link>
                    <Link
                      to="/courses"
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Học khóa phòng ngừa
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cảnh báo cho Parent Assessment - cần hỗ trợ tích cực */}
          {(assessment.id === 3 && risk === 'cần hỗ trợ tích cực') && (
            <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-800 mb-2">
                    ⚠️ CẢNH BÁO: Cần tăng cường hỗ trợ con cái
                  </h4>
                  <p className="text-red-700 mb-3">
                    Kết quả đánh giá cho thấy bạn cần tăng cường các biện pháp phòng ngừa và giám sát con cái. 
                    <strong> Chúng tôi khuyến nghị bạn nên:</strong>
                  </p>
                  <ul className="text-red-700 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Tham gia các khóa học về kỹ năng làm cha mẹ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Học phương pháp giao tiếp hiệu quả với con</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Tư vấn với chuyên gia tâm lý gia đình</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Thiết lập các quy tắc và giới hạn rõ ràng</span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/appointments"
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tư vấn chuyên gia
                    </Link>
                    <Link
                      to="/courses"
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Học khóa làm cha mẹ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cảnh báo cho School Assessment - cần tăng cường đáng kể */}
          {(assessment.id === 4 && risk === 'cần tăng cường đáng kể') && (
            <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-800 mb-2">
                    ⚠️ CẢNH BÁO: Cần xây dựng chương trình phòng ngừa ngay lập tức
                  </h4>
                  <p className="text-red-700 mb-3">
                    Kết quả đánh giá cho thấy nhà trường cần xây dựng và triển khai ngay các chương trình phòng ngừa ma túy. 
                    <strong> Chúng tôi khuyến nghị nhà trường nên:</strong>
                  </p>
                  <ul className="text-red-700 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Xây dựng chương trình phòng ngừa ma túy toàn diện</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Đào tạo giáo viên về kỹ năng phát hiện và xử lý</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Thiết lập hệ thống giám sát và báo cáo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Phối hợp với phụ huynh và cộng đồng</span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/appointments"
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tư vấn chuyên gia
                    </Link>
                    <Link
                      to="/courses"
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Khóa đào tạo giáo viên
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-lg mb-2 text-primary-700">Nhận xét và gợi ý:</h4>
            {assessment.id <= 2 ? (
              <p className="text-gray-700">
                {risk === 'cao' && 'Bạn đang có nguy cơ cao về sử dụng chất gây nghiện. Hãy tham khảo các khóa học được đề xuất và liên hệ với chuyên gia để được tư vấn kịp thời.'}
                {risk === 'trung bình' && 'Bạn có một số dấu hiệu cần lưu ý. Việc tham gia các khóa học phòng ngừa và tham khảo ý kiến chuyên gia sẽ giúp bạn phòng tránh rủi ro tốt hơn.'}
                {risk === 'thấp' && 'Bạn đang có mức độ rủi ro thấp. Tuy nhiên, việc trang bị kiến thức phòng ngừa vẫn rất quan trọng để duy trì lối sống lành mạnh.'}
              </p>
            ) : assessment.id === 3 ? (
              <p className="text-gray-700">
                {risk === 'cần hỗ trợ tích cực' && 'Bạn cần tăng cường các biện pháp phòng ngừa và giám sát con cái. Hãy tham khảo các khóa học về kỹ năng làm cha mẹ và phương pháp giao tiếp với con.'}
                {risk === 'cần tăng cường' && 'Bạn đã có những biện pháp phòng ngừa cơ bản. Tuy nhiên, cần tăng cường thêm kiến thức và kỹ năng để bảo vệ con tốt hơn.'}
                {risk === 'hiệu quả tốt' && 'Bạn đang thực hiện tốt vai trò phòng ngừa. Hãy duy trì và chia sẻ kinh nghiệm với các phụ huynh khác.'}
              </p>
            ) : (
              <p className="text-gray-700">
                {risk === 'cần tăng cường đáng kể' && 'Nhà trường cần xây dựng và triển khai ngay các chương trình phòng ngừa ma túy. Hãy tham khảo các khóa học và chương trình đào tạo cho giáo viên.'}
                {risk === 'cần cải thiện' && 'Nhà trường đã có những hoạt động phòng ngừa, nhưng cần cải thiện và đa dạng hóa các hình thức triển khai để tăng hiệu quả.'}
                {risk === 'triển khai tốt' && 'Nhà trường đang thực hiện tốt công tác phòng ngừa. Hãy duy trì và phát triển thêm các hoạt động hiệu quả.'}
              </p>
            )}
          </div>

          <h3 className="text-xl font-bold mb-4 text-primary-700">Các khóa học được gợi ý:</h3>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <div key={course.CourseID} className="bg-white border-2 border-primary-100 rounded-xl shadow-lg p-5 flex flex-col justify-between">
                    <img
                      src={course.ImageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkjDrG5oIMSRw6BvIHThuqFvPC90ZXh0Pjwvc3ZnPg=='}
                      alt={course.CourseName}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        const fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkjDrG5oIMSRw6BvIHThuqFvPC90ZXh0Pjwvc3ZnPg==';
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <h4 className="text-lg font-bold text-primary-700 mb-2">{course.CourseName}</h4>
                    <p className="mb-2 text-gray-700">{course.Description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      Đối tượng: {course.Category?.map((category, index) => (
                        <span key={category.CategoryID}>
                          {category.CategoryName}
                          {index < course.Category.length - 1 ? ', ' : ''}
                        </span>
                      )) || 'Không xác định'}
                    </div>
                    <Link
                      to={`/courses/${course.CourseID}`}
                      className="mt-2 inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-bold shadow hover:from-accent-600 hover:to-primary-600 transition-all"
                    >
                      Xem khóa học
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <p className="text-lg">Không có khóa học phù hợp với đánh giá của bạn.</p>
                  <p className="text-sm mt-2">
                    Nguy cơ: <span className="font-semibold">{risk}</span> |
                    Đối tượng: <span className="font-semibold">{assessment.audiences.join(', ')}</span>
                  </p>
                  <p className="text-xs mt-1">Tổng số khóa học có sẵn: {courses.length}</p>
                </div>
              )}
            </div>
          )}

          <h3 className="text-xl font-bold mb-4 text-primary-700">Các chuyên viên gợi ý:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredConsultants.length > 0 ? (
              filteredConsultants.map(consultant => (
                <div key={consultant.AccountID} className="bg-white border-2 border-accent-100 rounded-xl shadow-lg p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={consultant.ImageUrl || DEFAULT_AVATAR}
                      alt={consultant.Name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-accent-300 shadow"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_AVATAR) {
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }
                      }}
                    />
                    <div>
                      <Link
                        className="text-accent-700 font-bold text-lg hover:underline"
                        to={`/counselor/${consultant.AccountID}`}
                      >
                        {consultant.Name}
                      </Link>
                      <div className="text-xs text-gray-500">{consultant.Title}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2 text-sm line-clamp-3">{consultant.Bio}</p>
                  <div className="text-xs text-gray-500 mb-1">
                    Chuyên môn: {consultant.Categories?.map((category, index) => (
                      <span key={category.CategoryID}>
                        {category.CategoryName}
                        {index < consultant.Categories.length - 1 ? ', ' : ''}
                      </span>
                    )) || 'Không xác định'}
                  </div>
                  <Link
                    to={'/appointments'}
                    state={{ counselorId: consultant.AccountID }}
                    className="mt-2 inline-block px-4 py-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-lg font-bold shadow hover:from-primary-600 hover:to-accent-600 transition-all"
                  >
                    Đặt lịch ngay
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <p className="text-lg">Không có chuyên viên phù hợp với đánh giá của bạn.</p>
                <p className="text-sm mt-2">
                  Đối tượng: <span className="font-semibold">{assessment.audiences.join(', ')}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetailPage;