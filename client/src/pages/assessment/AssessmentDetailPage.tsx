import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage, useFormikContext, FormikProps } from 'formik';
import * as Yup from 'yup';

import { assessmentData } from '../../data/assessmentData';
import { SqlCourse } from '../../types/Course';

interface GroupedConsultant {
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
}

interface NavigationButtonsProps {
    currentIndex: number;
    totalQuestions: number;
    onNext: () => void;
    onPrev: () => void;
}

interface NavigationButtonsPropsWithAssessment extends NavigationButtonsProps {
    assessment: any;
    formikProps: FormikProps<{ [key: string]: string | string[] }>;
}

const NavigationButtons: React.FC<NavigationButtonsPropsWithAssessment> = ({
    currentIndex,
    totalQuestions,
    onNext,
    onPrev,
    assessment,
    formikProps
}) => {
    const { values, errors, touched } = formikProps;
    const currentQuestion = assessment.questions[currentIndex];

    // Check if current question is answered
    const isCurrentQuestionAnswered = () => {
        const answer = values[currentQuestion.id];
        if (currentQuestion.type === 'checkbox') {
            return Array.isArray(answer) && answer.length > 0;
        }
        return Boolean(answer && answer !== '');
    };

    // Manual validation for the current question
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
            // Set error manually for this specific field
            formikProps.setFieldError(currentQuestion.id, validationError);
            formikProps.setFieldTouched(currentQuestion.id, true);
        } else {
            // Clear any previous errors and proceed
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

const AssessmentDetailPage: React.FC = () => {
    const { assessmentId } = useParams<{ assessmentId: string }>();

    const assessment = assessmentData[Number(assessmentId) - 1];
    const [result, setResult] = useState<number | null>(0);
    const [risk, setRisk] = useState<string>('thấp');
    const [courses, setCourses] = useState<SqlCourse[]>([]);
    const [consultants, setConsultants] = useState<GroupedConsultant[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [hasViewedResult, setHasViewedResult] = useState<boolean>(false);

    // Smooth scroll to top when changing questions
    const handleQuestionChange = (newIndex: number) => {
        setCurrentQuestionIndex(newIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    }, [risk, result, assessmentId]);

    // Clear localStorage when user navigates away or closes the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (hasViewedResult) {
                localStorage.removeItem(`assessmentResult_${assessmentId}`);
            }
        };

        const handlePopState = () => {
            if (hasViewedResult) {
                localStorage.removeItem(`assessmentResult_${assessmentId}`);
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Cleanup function - will run when component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            
            // Clear localStorage when component unmounts (user navigates away)
            if (hasViewedResult) {
                localStorage.removeItem(`assessmentResult_${assessmentId}`);
            }
        };
    }, [assessmentId, hasViewedResult]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch courses
                const coursesResponse = await fetch('http://localhost:5000/api/course');
                const coursesData = await coursesResponse.json();
                setCourses(coursesData.data || []);

                // Fetch consultants - make sure the endpoint is correct
                const consultantsResponse = await fetch('http://localhost:5000/api/consultant/category');
                const consultantsData = await consultantsResponse.json();

                // The API already returns grouped data, just filter out disabled ones
                const filteredConsultants = (consultantsData.data || []).filter(
                    (consultant: GroupedConsultant) => !consultant.IsDisabled
                );
                console.log('Filtered consultants:', filteredConsultants);
                setConsultants(filteredConsultants);

            } catch (error) {
                console.error('Error fetching data:', error);
                setCourses([]);
                setConsultants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter courses based on both risk and audience matching
    const getFilteredCourses = () => {
        console.log('=== COURSE FILTERING DEBUG ===');
        console.log('Current risk:', risk);
        console.log('Assessment audiences:', assessment.audiences);
        console.log('Total courses available:', courses.length);

        if (courses.length === 0) {
            console.log('No courses available to filter');
            return [];
        }

        const filtered = courses.filter(course => {
            console.log(`\n--- Filtering course: ${course.CourseName} ---`);
            console.log('Course risk:', course.Risk);
            console.log('Course categories:', course.Category?.map(cat => cat.CategoryName) || []);

            // Check if risk matches
            const riskMatches = course.Risk === risk;
            console.log('Risk matches:', riskMatches);

            // Check if any assessment audience matches any course category
            const audienceMatches = assessment.audiences.some(audience =>
                course.Category?.some(category => {
                    const audienceNormalized = audience.toLowerCase().trim();
                    const categoryNormalized = category.CategoryName.toLowerCase().trim();

                    console.log(`  Comparing audience "${audienceNormalized}" with category "${categoryNormalized}"`);

                    // Multiple matching strategies for flexibility
                    const exactMatch = audienceNormalized === categoryNormalized;
                    const audienceContainsCategory = audienceNormalized.includes(categoryNormalized);
                    const categoryContainsAudience = categoryNormalized.includes(audienceNormalized);

                    const matches = exactMatch || audienceContainsCategory || categoryContainsAudience;

                    if (matches) {
                        console.log(`  ✅ CATEGORY MATCH: ${matches}`);
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

        return filtered;
    };

    // Get consultants filtered by audience only (no risk filtering for consultants)
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

            // Check if any assessment audience matches any consultant category
            const audienceMatches = assessment.audiences.some(audience => {
                console.log(`Checking audience: "${audience}"`);

                return consultant.Categories.some(category => {
                    const audienceNormalized = audience.toLowerCase().trim();
                    const categoryNormalized = category.CategoryName.toLowerCase().trim();

                    console.log(`  Comparing "${audienceNormalized}" with "${categoryNormalized}"`);

                    // Multiple matching strategies for flexibility
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

    useEffect(() => {
        if (result !== null && result >= 8) {
            setRisk('cao');
        } else if (result !== null && result >= 4) {
            setRisk('trung bình');
        } else {
            setRisk('thấp');
        }
    }, [result]);

    const initialValues = assessment.questions.reduce((acc, q) => {
        acc[q.id] = q.type === 'checkbox' ? [] : '';
        return acc;
    }, {} as { [key: string]: string | string[] });

    const validationSchema = Yup.object(
        assessment.questions.reduce((acc, q) => {
            acc[q.id] = q.type === 'checkbox'
                ? Yup.array().min(1, 'Chọn ít nhất một lựa chọn')
                : Yup.string().required('Không được để trống');
            return acc;
        }, {} as { [key: string]: Yup.Schema<any> })
    );

    const calculateScore = (formValues: { [key: string]: string | string[] }) => {
        let total = 0;

        for (const question of assessment.questions) {
            const answer = formValues[question.id];

            if (question.type === 'checkbox' && Array.isArray(answer)) {
                total += answer.reduce((sum, val) => sum + Number(val), 0);
            }

            if (question.type !== 'checkbox' && typeof answer === 'string') {
                total += Number(answer);
            }
        }

        return total;
    };

    const handleSubmit = (values: typeof initialValues) => {
        console.log('Form values:', values);
        const total = calculateScore(values);

        // Store result in localStorage
        const resultData = {
            total,
            risk: total > 8 ? 'cao' : total > 4 ? 'trung bình' : 'thấp',
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`assessmentResult_${assessmentId}`, JSON.stringify(resultData));

        // Set state and mark as having viewed result
        setResult(total);
        setRisk(resultData.risk);
        setHasViewedResult(true);
    };

    // Function to reset the assessment
    const handleRedoAssessment = () => {
        // Clear the stored result for this specific assessment
        localStorage.removeItem(`assessmentResult_${assessmentId}`);

        // Reset state
        setResult(0);
        setRisk('thấp');
        setCurrentQuestionIndex(0);
        setHasViewedResult(false);

        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Function to clear data and navigate to assessments page
    const handleBackToAssessments = () => {
        // Clear the stored result for this specific assessment
        localStorage.removeItem(`assessmentResult_${assessmentId}`);
        
        // Reset hasViewedResult to prevent cleanup from firing
        setHasViewedResult(false);
        
        // Navigate to assessments page
        window.location.href = '/assessments';
    };

    // Get filtered results only when result is submitted
    const filteredCourses = result !== null && result > 0 ? getFilteredCourses() : [];
    const filteredConsultants = result !== null && result > 0 ? getFilteredConsultants() : [];

    console.log(filteredConsultants);

    return (
        <div className='container mx-auto px-4 py-8'>
            {result === 0 && (
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    validateOnChange={false}
                    validateOnBlur={false}
                    validate={(values) => {
                        // Custom validation logic - only validate fields that have been touched
                        const errors: { [key: string]: string } = {};
                        return errors; // Return empty errors to prevent automatic validation
                    }}
                >
                    {(formikProps: FormikProps<{ [key: string]: string | string[] }>) => (
                        <>
                            <Form className='max-w-2xl mx-auto py-8 px-6 bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl border-2 border-accent-100'>
                                <div className='text-center mb-8'>
                                    <h1 className='text-3xl font-extrabold text-primary-700 mb-2'>
                                        {assessment.title}
                                    </h1>
                                    <p className='text-gray-600 text-lg'>
                                        {assessment.description}
                                    </p>
                                    <div className='mt-4 flex justify-center items-center gap-4 text-sm text-gray-500'>
                                        <span>{assessment.questionCount} câu hỏi</span>
                                        <span>•</span>
                                        <span>~{assessment.timeToComplete} phút</span>
                                    </div>
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
                                            {/* Navigation Buttons - Positioned on sides of question card */}
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                {/* Left Button - Quay lại */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionChange(Math.max(0, currentQuestionIndex - 1))}
                                                    disabled={currentQuestionIndex === 0}
                                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-lg ${
                                                        currentQuestionIndex === 0
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white hover:from-gray-600 hover:to-gray-500 hover:scale-110'
                                                    }`}
                                                    title="Quay lại"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>

                                                {/* Question Card */}
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

                                                {/* Right Button - Tiếp theo hoặc Hoàn thành */}
                                                {currentQuestionIndex < assessment.questions.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const validationError = (() => {
                                                                const answer = formikProps.values[question.id];
                                                                if (question.type === 'checkbox') {
                                                                    return Array.isArray(answer) && answer.length > 0 ? null : 'Chọn ít nhất một lựa chọn';
                                                                }
                                                                return answer && answer !== '' ? null : 'Không được để trống';
                                                            })();
                                                            
                                                            if (validationError) {
                                                                formikProps.setFieldError(question.id, validationError);
                                                                formikProps.setFieldTouched(question.id, true);
                                                            } else {
                                                                formikProps.setFieldError(question.id, undefined);
                                                                handleQuestionChange(Math.min(assessment.questions.length - 1, currentQuestionIndex + 1));
                                                            }
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
                                                            const validationError = (() => {
                                                                const answer = formikProps.values[question.id];
                                                                if (question.type === 'checkbox') {
                                                                    return Array.isArray(answer) && answer.length > 0 ? null : 'Chọn ít nhất một lựa chọn';
                                                                }
                                                                return answer && answer !== '' ? null : 'Không được để trống';
                                                            })();
                                                            
                                                            if (validationError) {
                                                                formikProps.setFieldError(question.id, validationError);
                                                                formikProps.setFieldTouched(question.id, true);
                                                            } else {
                                                                formikProps.setFieldError(question.id, undefined);
                                                                formikProps.submitForm();
                                                            }
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

            {result !== null && result > 0 && (
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
                        </div>
                    </div>

                    <div className="mb-8 flex items-center gap-4">
                        <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold shadow-md
                            ${risk === 'cao' ? 'bg-error-100 text-error-700' : risk === 'trung bình' ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'}`}
                        >
                            Nguy cơ sử dụng ma túy: {risk.toUpperCase()}
                        </span>
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
                                            src={course.ImageUrl}
                                            alt={course.CourseName}
                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-course.jpg';
                                            }}
                                        />
                                        <h4 className="text-lg font-bold text-primary-700 mb-2">{course.CourseName}</h4>
                                        <p className="mb-2 text-gray-700">{course.Description}</p>

                                        <div className="text-xs text-gray-500 mb-2">Mức độ rủi ro: {course.Risk}</div>
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
                                            src={consultant.ImageUrl}
                                            alt={consultant.Name}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-accent-300 shadow"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-avatar.jpg';
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
                                <p className="text-xs mt-1">Tổng số chuyên viên có sẵn: {consultants.length}</p>
                                <div className="mt-4 text-xs text-left bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
                                    <p className="font-semibold mb-2">Debug info:</p>
                                    <p className="mb-1">Assessment audiences: {JSON.stringify(assessment.audiences)}</p>
                                    <p className="mb-1">Available consultant categories: {[...new Set(consultants.flatMap(c => c.Categories?.map(cat => cat.CategoryName) || []))].join(', ')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentDetailPage;