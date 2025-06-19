import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { assessmentData } from '../../data/assessmentData';
import { courseData } from '../../data/courseData';
import { counselorData } from '../../data/counselorData';

const AssessmentDetailPage: React.FC = () => {
    const { assessmentId } = useParams<{ assessmentId: string }>();

    const assessment = assessmentData[Number(assessmentId) - 1];
    const [result, setResult] = useState<number | null>(0)
    const [risk, setRisk] = useState<string>('thấp');

    const [recommendedCounselor, setRecommendedCounselor] = useState(() =>
        counselorData.filter(counselor => counselor.id === 5 || counselor.id === 6)
    );
    useEffect(() => {
        if (result !== null && result >= 8) {
            setRisk('cao');
            setRecommendedCounselor(counselorData.filter(counselor => counselor.id === 3 || counselor.id === 4));
        } else if (result !== null && result >= 4) {
            setRisk('trung bình');
            setRecommendedCounselor(counselorData.filter(counselor => counselor.id === 1 || counselor.id === 2));
        } else {
            setRisk('thấp');
            setRecommendedCounselor(counselorData.filter(counselor => counselor.id === 5 || counselor.id === 6));
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

    const handleSuggestedCourse = () => {
        return courseData.filter(course => course.risk === risk);
    }

    const calculateScore = (formValues: { [key: string]: string | string[] }) => {
        let total = 0;

        for (const question of assessment.questions) {
            const answer = formValues[question.id];
            console.log(answer);


            if (question.type === 'checkbox' && Array.isArray(answer)) {
                // Sum all selected checkbox values
                total += answer.reduce((sum, val) => sum + Number(val), 0);
            }

            if (question.type !== 'checkbox' && typeof answer === 'string') {
                // Add selected radio value
                total += Number(answer);
                console.log(total);
            }
        }

        return total;
    };

    const handleSubmit = (values: typeof initialValues) => {
        const total = calculateScore(values);
        setResult(total);
    }

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
                            type='submit'>Hoàn thành đánh giá</button>
                    </Form>
                </Formik>
            )}

            {result !== null && result > 0 && (
                <div className="my-10 max-w-3xl mx-auto bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl border-2 border-accent-100 p-8 animate-fade-in">
                    <h2 className="text-3xl font-extrabold mb-4 text-accent-700 flex items-center gap-3">
                        🎉 Kết quả đánh giá
                    </h2>
                    <div className="mb-8 flex items-center gap-4">
                        <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold shadow-md
                            ${risk === 'cao' ? 'bg-error-100 text-error-700' : risk === 'trung bình' ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'}`}
                        >
                            Nguy cơ sử dụng ma túy: {risk.toUpperCase()}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-primary-700">Các khóa học được gợi ý:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {handleSuggestedCourse().map(course => (
                            <div key={course.id} className="bg-white border-2 border-primary-100 rounded-xl shadow-lg p-5 flex flex-col justify-between">
                                <h4 className="text-lg font-bold text-primary-700 mb-2">{course.title}</h4>
                                <p className="mb-2 text-gray-700">{course.description}</p>
                                <div className="text-xs text-gray-500 mb-2">Thời lượng: {course.duration} phút</div>
                                <div className="text-xs text-gray-500 mb-2">Đối tượng: {course.audience}</div>
                                <div className="text-xs text-gray-500 mb-2">Lĩnh vực: {course.category}</div>
                                <Link to={`/courses/${course.id}`} className="mt-2 inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-bold shadow hover:from-accent-600 hover:to-primary-600 transition-all">Xem khóa học</Link>
                            </div>
                        ))}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-primary-700">Các chuyên viên gợi ý:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendedCounselor.map(counselor => (
                            <div key={counselor.id} className="bg-white border-2 border-accent-100 rounded-xl shadow-lg p-5 flex flex-col justify-between">
                                <div className="flex items-center gap-4 mb-2">
                                    <img src={counselor.imageUrl} alt={counselor.name} className="w-14 h-14 rounded-full object-cover border-2 border-accent-300 shadow" />
                                    <div>
                                        <Link className="text-accent-700 font-bold text-lg hover:underline" to={`/counselor/${counselor.id}`}>{counselor.name}</Link>
                                        <div className="text-xs text-gray-500">{counselor.title}</div>
                                        <div className="text-xs text-yellow-600">Đánh giá: {counselor.rating} ⭐</div>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-2 text-sm line-clamp-3">{counselor.bio}</p>
                                <div className="text-xs text-gray-500 mb-1">Ngôn ngữ: {counselor.languages.join(', ')}</div>
                                <Link
                                    to={'/appointments'}
                                    state={{ counselorId: counselor.id }}
                                    className="mt-2 inline-block px-4 py-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-lg font-bold shadow hover:from-primary-600 hover:to-accent-600 transition-all"
                                >
                                    Đặt lịch ngay
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div >
    )
};

export default AssessmentDetailPage;
