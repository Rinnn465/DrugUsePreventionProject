
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { assessmentData } from '../data/assessmentData';
import { courseData } from '../data/courseData';
import { counselorData } from '../data/counselorData';

const AssessmentDetailPage: React.FC = () => {
    const { assessmentId } = useParams<{ assessmentId: string }>();

    const assessment = assessmentData[Number(assessmentId) - 1];
    const [result, setResult] = useState<number>(0)
    const [risk, setRisk] = useState<string>('thấp');

    let recommendedCounselor = counselorData.filter(counselor => counselor.id === 5 || counselor.id === 6);

    useEffect(() => {
        if (result >= 4) {
            setRisk('trung bình')
            recommendedCounselor = counselorData.filter(counselor => counselor.id === 1 || counselor.id === 2);
        } else if (result >= 8) {
            setRisk('cao')
            recommendedCounselor = counselorData.filter(counselor => counselor.id === 3 || counselor.id === 4);
        }
    }, [result]);

    const initialValues = assessment.questions.reduce((acc, q) => {
        acc[q.id] = q.type === 'checkbox' ? [] : '';
        return acc;
    }, {} as { [key: string]: string | string[] });


    const validationSchema = Yup.object(
        assessment.questions.reduce((acc, q) => {
            acc[q.id] = q.type === 'checkbox'
                ? Yup.array().min(1, 'Select at least one option')
                : Yup.string().required('Select one option');
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

            if (question.type === 'checkbox' && Array.isArray(answer)) {
                // Sum all selected checkbox values
                total += answer.reduce((sum, val) => sum + Number(val), 0);
            }

            if (question.type === 'radio' && typeof answer === 'string') {
                // Add selected radio value
                total += Number(answer);
            }
        }

        return total;
    };

    const handleSubmit = (values: typeof initialValues) => {
        // alert(JSON.stringify(values, null, 2));
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
                    <Form className='container mx-auto py-4 px-8'>
                        {assessment.questions.map((question) => {
                            return (
                                <div aria-labelledby="checkbox-group" key={question.id} className='mb-6'>
                                    <p className='text-lg font-medium mb-2'>{question.text}</p>
                                    {question.options.map((option) => {
                                        return (
                                            <label key={option.id} className='block mb-2'>
                                                {question.type === 'checkbox' ? (
                                                    <Field
                                                        type='checkbox'
                                                        name={question.id}
                                                        value={String(option.value)}
                                                        className='mr-2 accent-primary-500 scale-125'
                                                    />
                                                ) : (
                                                    <Field
                                                        type='radio'
                                                        name={question.id}
                                                        value={String(option.value)}
                                                        className='mr-2 accent-primary-500 scale-125'
                                                    />
                                                )}
                                                {option.text}
                                            </label>
                                        )
                                    })}
                                    <ErrorMessage
                                        name={String(question.id)}
                                        component={'div'}
                                        className='text-red-500 text-sm'
                                    />
                                </div>
                            )
                        })}
                        <button type='submit'>Submit</button>
                    </Form>
                </Formik>
            )}

            {result > 0 && (
                <div className='my-6'>
                    <h2 className='text-2xl font-bold mb-4'>Kết quả</h2>
                    <p className='text-lg'>Điểm của bạn: {result}</p>
                    <p className='text-lg'>Nguy cơ sử dụng ma túy: {risk}</p>

                    <h3 className='text-xl mb-4'>Các khóa học được gợi ý: </h3>
                    {handleSuggestedCourse().map(course => (
                        <div key={course.id} className='border p-4 rounded-md shadow-md mb-4'>
                            <h4 className='text-lg font-bold'>{course.title}</h4>
                            <p>{course.description}</p>
                            <p className='text-sm text-gray-500'>Thời lượng: {course.duration}</p>
                            <p className='text-sm text-gray-500'>Đối tượng: {course.audience}</p>
                            <p className='text-sm text-gray-500'>Lĩnh vực: {course.category}</p>
                            <Link to={`/courses/${course.id}`} className='text-primary-600 hover:underline'>
                                Xem khóa học
                            </Link>
                        </div>
                    ))}
                    <h2 className='text-3xl font-bold mb-6'>Các chuyên viên gợi ý: </h2>
                    {recommendedCounselor.map(counselor => {
                        return (
                            <div key={counselor.id}>
                                <Link
                                    className='text-primary-600 hover:underline'
                                    to={`/counselor/${counselor.id}`}>
                                    <h3 className='text-xl font-bold mb-2'>{counselor.name}</h3>
                                </Link>
                                <p className='text-md mb-2'>{counselor.title}</p>
                                <p className='text-gray-700 mb-2'>{counselor.bio}</p>
                                <p className='text-gray-500 mb-2'>Đánh giá: {counselor.rating} ⭐</p>
                                <p className='text-gray-500 mb-2'>Ngôn ngữ: {counselor.languages.join(', ')}</p>
                                <Link
                                    to={'/appointments'}
                                    state={{ counselorId: counselor.id }}
                                    className='inline-block mb-12 mt-2 p-3 bg-primary-500 text-white rounded-md hover:bg-primary-600'
                                >
                                    <button className='text-md' >
                                        Đặt lịch ngay
                                    </button>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )
            }
        </div >
    )
};

export default AssessmentDetailPage;
