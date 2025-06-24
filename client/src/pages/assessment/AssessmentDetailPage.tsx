import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { assessmentData } from '../../data/assessmentData';
import { SqlCourse } from '../../types/Course';

interface GroupedConsultant {
    ConsultantID: number;
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

const AssessmentDetailPage: React.FC = () => {
    const { assessmentId } = useParams<{ assessmentId: string }>();

    const assessment = assessmentData[Number(assessmentId) - 1];
    const [result, setResult] = useState<number | null>(0);
    const [risk, setRisk] = useState<string>('thấp');
    const [courses, setCourses] = useState<SqlCourse[]>([]);
    const [consultants, setConsultants] = useState<GroupedConsultant[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const storedResult = localStorage.getItem(`assessmentResult_${assessmentId}`);
        if (storedResult) {
            const parsedResult = JSON.parse(storedResult);
            setResult(parsedResult.total);
            setRisk(parsedResult.risk);
        }
    }, [risk, result]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch courses
                const coursesResponse = await fetch('http://localhost:5000/api/course');
                const coursesData = await coursesResponse.json();
                console.log('Fetched courses:', coursesData);
                setCourses(coursesData.data || []);

                // Fetch consultants - make sure the endpoint is correct
                const consultantsResponse = await fetch('http://localhost:5000/api/consultant/category');
                const consultantsData = await consultantsResponse.json();
                console.log('Fetched consultants:', consultantsData);

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
        const total = calculateScore(values);
        let calculatedRisk = 'thấp';

        if (total >= 8) {
            calculatedRisk = 'cao';
        } else if (total >= 4) {
            calculatedRisk = 'trung bình';
        }

        // Store result with assessment ID to prevent conflicts
        localStorage.setItem(`assessmentResult_${assessmentId}`, JSON.stringify({
            total,
            risk: calculatedRisk,
            timestamp: new Date().toISOString()
        }));

        setResult(total);
        setRisk(calculatedRisk);
    };

    // Function to reset the assessment
    const handleRedoAssessment = () => {
        // Clear the stored result for this specific assessment
        localStorage.removeItem(`assessmentResult_${assessmentId}`);

        // Reset state
        setResult(0);
        setRisk('thấp');

        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get filtered results only when result is submitted
    const filteredCourses = result !== null && result > 0 ? getFilteredCourses() : [];
    const filteredConsultants = result !== null && result > 0 ? getFilteredConsultants() : [];

    return (
        <div className='container mx-auto px-4 py-8'>
            {result === 0 && (
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    <Form className='max-w-2xl mx-auto py-8 px-6 bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl border-2 border-accent-100 animate-fade-in'>
                        <div className='text-center mb-8'>
                            <h1 className='text-3xl font-extrabold text-primary-700 mb-2'>
                                📋 {assessment.title}
                            </h1>
                            <p className='text-gray-600 text-lg'>
                                {assessment.description}
                            </p>
                            <div className='mt-4 flex justify-center items-center gap-4 text-sm text-gray-500'>
                                <span>📝 {assessment.questionCount} câu hỏi</span>
                                <span>•</span>
                                <span>⏱️ ~{assessment.timeToComplete} phút</span>
                            </div>
                        </div>
                        {assessment.questions.map((question, index) => {
                            return (
                                <div aria-labelledby="checkbox-group" key={question.id} className='mb-8 p-6 bg-white rounded-xl shadow-lg border border-accent-100'>
                                    <p className='text-lg font-bold mb-4 text-blue-500'>
                                        <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mr-3">
                                            Câu {index + 1}
                                        </span>
                                        {question.text}
                                    </p>
                                    {question.options.map((option) => {
                                        return (
                                            <label key={option.id} className='block mb-3 cursor-pointer hover:bg-accent-50 rounded-lg px-3 py-2 transition-all'>
                                                {question.type === 'checkbox' ? (
                                                    <Field
                                                        type='checkbox'
                                                        name={question.id}
                                                        value={String(option.value)}
                                                        className='mr-3 accent-accent-500 scale-150'
                                                    />
                                                ) : (
                                                    <Field
                                                        type='radio'
                                                        name={question.id}
                                                        value={String(option.value)}
                                                        className='mr-3 accent-accent-500 scale-150'
                                                    />
                                                )}
                                                <span className='font-medium text-blue-500'>{option.text}</span>
                                            </label>
                                        )
                                    })}
                                    <ErrorMessage
                                        name={String(question.id)}
                                        component={'div'}
                                        className='text-red-500 text-sm mt-1'
                                    />
                                </div>
                            )
                        })}
                        <button
                            className='w-full py-3 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all font-bold shadow-lg text-lg mt-4'
                            type='submit'>
                            Hoàn thành đánh giá
                        </button>
                    </Form>
                </Formik>
            )}

            {result !== null && result > 0 && (
                <div className="my-10 max-w-3xl mx-auto bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl border-2 border-accent-100 p-8 animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-extrabold text-accent-700 flex items-center gap-3">
                            🎉 Kết quả đánh giá
                        </h2>
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
                                        <div className="text-xs text-gray-500 mb-2">Đã đăng ký: {course.EnrollCount} người</div>
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
                                    <div className="mt-4 text-xs text-left bg-gray-100 p-3 rounded">
                                        <p className="font-semibold mb-2">Debug info:</p>
                                        <p>Available course risks: {[...new Set(courses.map(c => c.Risk))].join(', ')}</p>
                                        <p>Available course categories: {[...new Set(courses.flatMap(c => c.Category?.map(cat => cat.CategoryName) || []))].join(', ')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <h3 className="text-xl font-bold mb-4 text-primary-700">Các chuyên viên gợi ý:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredConsultants.length > 0 ? (
                            filteredConsultants.map(consultant => (
                                <div key={consultant.ConsultantID} className="bg-white border-2 border-accent-100 rounded-xl shadow-lg p-5 flex flex-col justify-between">
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
                                                to={`/counselor/${consultant.ConsultantID}`}
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
                                        state={{ counselorId: consultant.ConsultantID }}
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