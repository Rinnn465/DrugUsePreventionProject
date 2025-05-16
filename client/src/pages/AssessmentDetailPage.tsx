import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { assessmentData } from '../data/assessmentData';
import { courseData } from '../data/courseData';

const AssessmentDetailPage: React.FC = () => {
    const { id } = useParams();
    const assessment = assessmentData[Number(id) - 1];
    const [result, setResult] = useState<number>(0);
    const [risk, setRisk] = useState<string>('low');

    const initialValues: Record<string, string> = {};
    const validationShape: Record<string, Yup.StringSchema> = {};

    useEffect(() => {
        if (result >= 4) {
            setRisk('high')
        } else if (result >= 1) {
            setRisk('medium')
        }
    }, [result])

    const handleSuggestedCourse = () => {
        return courseData.filter(course => course.risk === risk);
    }

    assessment.questions.forEach(q => {
        const fieldName = `question-${q.id}`;
        initialValues[fieldName] = '';
        validationShape[fieldName] = Yup.string().required('Required');
    });

    const validationSchema = Yup.object().shape(validationShape);

    const handleSubmit = (values: Record<string, string>) => {
        let total = 0;
        for (const key in values) {
            total += Number(values[key]);
        }

        // alert(`Your total score is: ${total}`);
        setResult(total);
    };

    return (
        <div className='container mx-auto py-4 px-8'>
            {result === 0 && <>
                <h2 className='text-2xl font-bold mb-4'>{assessment.title}</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form>
                            {assessment.questions.map((question) => (
                                <div key={question.id} className='mb-6'>
                                    <p className='text-lg font-medium mb-2'>{question.text}</p>
                                    {question.options.map((option) => {
                                        const fieldName = `question-${question.id}`;
                                        return (
                                            <label key={option.id} className='block mb-2'>
                                                <Field
                                                    type='radio'
                                                    name={fieldName}
                                                    value={String(option.value)}
                                                    className='mr-2 accent-primary-500 scale-125'
                                                />
                                                {option.text}
                                            </label>
                                        );
                                    })}
                                    <ErrorMessage name={`question-${question.id}`} component="div" className="text-red-500" />
                                </div>
                            ))}

                            <button type='submit' className='mt-6 bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700'>
                                Submit
                            </button>
                        </Form>
                    )}
                </Formik>
            </>}

            {result > 0 && (
                <div className='my-6'>
                    <h2 className='text-2xl font-bold mb-4'>Your Result</h2>
                    <p className='text-lg'>Your total score is: {result}</p>

                    <h3 className='text-xl mb-4'>Some suggested course: </h3>
                    {handleSuggestedCourse().map(course => (
                        <div key={course.id} className='border p-4 rounded-md shadow-md mb-4'>
                            <h4 className='text-lg font-bold'>{course.title}</h4>
                            <p>{course.description}</p>
                            <p className='text-sm text-gray-500'>Duration: {course.duration}</p>
                            <p className='text-sm text-gray-500'>Audience: {course.audience}</p>
                            <p className='text-sm text-gray-500'>Category: {course.category}</p>
                            <Link to={`/courses/${course.id}`} className='text-primary-600 hover:underline'>
                                View Course
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssessmentDetailPage;
