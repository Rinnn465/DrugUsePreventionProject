import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { sqlLesson } from "../../types/Lesson";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import apiUtils, { courses } from "../../utils/apiUtils";
import {
    CheckCircle,
    Clock,
    Video,
    Award,
    ArrowLeft,
    ChevronRight,
    FileText,
    BookOpen,
    Users,
    Target,
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    Lock
} from "lucide-react";

const LessonDetailsPage: React.FC = () => {
    const { id } = useParams();
    const { user } = useUser();
    const isSkippable = import.meta.env.VITE_IS_UNSKIPPABLE === 'true';

    const [selected, setSelected] = useState<string | number>("lesson");
    const [lesson, setLesson] = useState<sqlLesson[] | null>(null);
    const [completedLessons, setCompletedLessons] = useState<Set<string | number>>(
        new Set()
    );
    const [isLessonEnrolled, setIsLessonEnrolled] = useState<boolean>(false);
    const [videoProgress, setVideoProgress] = useState<{ [key: string]: number }>({});
    const [lastValidTime, setLastValidTime] = useState<{ [key: string]: number }>({});
    const [completedMilestones, setCompletedMilestones] = useState<{ [key: string]: Set<number> }>({});

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(1);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
    const [showControls, setShowControls] = useState<boolean>(true);
    const [courseCompleted, setCourseCompleted] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const isSeekingRef = useRef(false);
    const playerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<number | null>(null);
    const lastCompletionTimeRef = useRef<Map<string | number, number>>(new Map());
    const completionInProgressRef = useRef<Set<string | number>>(new Set());
    const completionToastShownRef = useRef<Set<string | number>>(new Set());


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selected]);

    useEffect(() => {
        const fetchLessonDetail = async () => {
            try {
                const lessonsData = await courses.getLessons(Number(id));
                setLesson(lessonsData);

                // Set first lesson as selected by default if no lesson is selected
                if (lessonsData && lessonsData.length > 0 && selected === 'lesson') {
                    setSelected(lessonsData[0].LessonID);
                }
            } catch (error) {
                console.error("Fetch lesson error:", error);
                toast.error("Không thể tải danh sách bài học");
            }
        };

        const fetchCourseData = async () => {
            try {
                await courses.getById(Number(id));
                // Course data loaded successfully
            } catch (error) {
                console.error("Fetch course error:", error);
                toast.error("Không thể tải thông tin khóa học");
            }
        };

        const fetchData = async () => {
            await Promise.all([fetchLessonDetail(), fetchCourseData()]);
        };

        if (id) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Separate useEffect for fetching lesson progress after lessons are loaded
    useEffect(() => {
        const fetchAllLessonProgress = async () => {
            if (!lesson || lesson.length === 0 || !user?.AccountID) {
                return;
            }

            try {
                // Fetch progress for all lessons in parallel
                const progressPromises = lesson.map(async (lessonItem) => {
                    try {
                        const progressData = await apiUtils.courses.getLessonDetail(
                            Number(id),
                            lessonItem.LessonID,
                            user.AccountID
                        );
                        return {
                            lessonId: lessonItem.LessonID,
                            progressData: progressData
                        };
                    } catch {
                        // If lesson progress doesn't exist, return null
                        console.log(`No progress found for lesson ${lessonItem.LessonID}`);
                        return {
                            lessonId: lessonItem.LessonID,
                            progressData: null
                        };
                    }
                });

                const progressResults = await Promise.allSettled(progressPromises);

                // Process the results
                const newVideoProgress: { [key: string]: number } = {};
                const newLastValidTime: { [key: string]: number } = {};
                const newCompletedLessons = new Set<string | number>();
                const newCompletedMilestones: { [key: string]: Set<number> } = {};

                progressResults.forEach((result) => {
                    if (result.status === 'fulfilled' && result.value.progressData) {
                        const { lessonId, progressData } = result.value;
                        const lessonIdStr = lessonId.toString();

                        // Set video progress
                        newVideoProgress[lessonIdStr] = progressData.CompletionPercentage || 0;

                        // Set last valid time (if available in your database schema)
                        newLastValidTime[lessonIdStr] = progressData.LastValidTime || 0;

                        // Initialize milestones based on current progress
                        const currentProgress = progressData.CompletionPercentage || 0;
                        const milestonesSet = new Set<number>();
                        for (let i = 10; i <= Math.floor(currentProgress / 10) * 10; i += 10) {
                            milestonesSet.add(i);
                        }
                        newCompletedMilestones[lessonIdStr] = milestonesSet;

                        // Mark as completed if necessary
                        if (progressData.IsCompleted) {
                            newCompletedLessons.add(lessonId);
                        }
                    }
                });

                // Update state with all progress data
                setVideoProgress(prev => ({ ...prev, ...newVideoProgress }));
                setLastValidTime(prev => ({ ...prev, ...newLastValidTime }));
                setCompletedMilestones(prev => ({ ...prev, ...newCompletedMilestones }));
                setCompletedLessons(prev => {
                    const updatedSet = new Set(prev);
                    newCompletedLessons.forEach(lessonId => updatedSet.add(lessonId));
                    return updatedSet;
                });

            } catch (error) {
                console.error("Fetch lesson progress error:", error);
                toast.error("Không thể tải tiến độ bài học");
            }
        };

        fetchAllLessonProgress();
    }, [lesson, user?.AccountID, id]);

    // console.log(lastValidTime);

    useEffect(() => {
        const checkEnrollmentLesson = async () => {
            if (!id || !selected || typeof selected !== 'number') return;
            try {
                const enrollmentStatus = await apiUtils.courses.checkLessonEnrollment(Number(id), Number(selected), user?.AccountID || 0);
                console.log('Enrollment status response:', enrollmentStatus);

                // Handle different response formats
                const isEnrolled = enrollmentStatus?.isEnrolled || enrollmentStatus?.data?.isEnrolled || false;
                setIsLessonEnrolled(isEnrolled);

                console.log('Lesson enrollment status for lesson', selected, ':', isEnrolled);

            } catch (error) {
                console.error("Error checking enrollment:", error);
                // If there's an error, assume not enrolled and try to enroll
                setIsLessonEnrolled(false);
                toast.error("Không thể kiểm tra đăng ký bài học");
            }
        }

        checkEnrollmentLesson();
    }, [id, selected, user?.AccountID]);

    // Separate effect for enrolling in lesson if not already enrolled
    useEffect(() => {
        const enrollInLesson = async () => {
            if (!id || !selected || typeof selected !== 'number') return;
            if (isLessonEnrolled) return; // Already enrolled
            if (!user?.AccountID) return; // No user

            try {
                console.log('Attempting to enroll in lesson:', selected, 'for user:', user.AccountID);

                // First try to enroll
                await apiUtils.courses.lessonEnroll(selected, user.AccountID);
                console.log('Enrollment API call completed for lesson:', selected);

                // Wait a bit for the database to update
                await new Promise(resolve => setTimeout(resolve, 500));

                // Re-check enrollment status after enrolling
                const enrollmentStatus = await apiUtils.courses.checkLessonEnrollment(Number(id), Number(selected), user.AccountID);
                const isEnrolled = enrollmentStatus?.isEnrolled || enrollmentStatus?.data?.isEnrolled || false;
                setIsLessonEnrolled(isEnrolled);

                if (isEnrolled) {
                    console.log('Successfully enrolled and verified for lesson:', selected);
                } else {
                    console.warn('Enrollment may have failed for lesson:', selected);
                }
            } catch (error: unknown) {
                console.error("Error enrolling in lesson:", error);

                // If the error indicates already enrolled, that's okay
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

                if (responseMessage?.includes('đã đăng ký')) {
                    setIsLessonEnrolled(true);
                    console.log('User was already enrolled in lesson:', selected);
                } else {
                    toast.error("Không thể đăng ký bài học: " + (responseMessage || errorMessage));
                }
            }
        }

        // Add a small delay before trying to enroll to let the check complete first
        const timeoutId = setTimeout(() => {
            if (!isLessonEnrolled) {
                enrollInLesson();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [id, selected, user?.AccountID, isLessonEnrolled]);

    // Auto-hide controls
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        };

        const playerElement = playerRef.current;
        if (playerElement) {
            playerElement.addEventListener('mousemove', handleMouseMove);
            return () => {
                playerElement.removeEventListener('mousemove', handleMouseMove);
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }
            };
        }
    }, [isPlaying]);

    const completeCourse = useCallback(async () => {
        if (!user?.AccountID) {
            toast.error("Bạn cần đăng nhập để hoàn thành khóa học");
            return;
        }

        try {
            await courses.complete(Number(id), user.AccountID);
            toast.success("🏆 Khóa học đã được hoàn thành thành công!");
        } catch (error) {
            console.error("Error completing course:", error);
            toast.error("Không thể hoàn thành khóa học");
        }
    }, [user?.AccountID, id]);

    const checkCourseCompletion = useCallback(() => {
        const allLessonsCompleted = !lesson || completedLessons.size === lesson.length;
        if (allLessonsCompleted && !courseCompleted) {
            setCourseCompleted(true);
            toast.success("🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài học.");
            completeCourse();
            return true;
        }
        return false;
    }, [lesson, completedLessons.size, courseCompleted, completeCourse]);

    const handleVideoTimeUpdate = (lessonId: string | number) => {
        if (videoRef.current && !isSeekingRef.current && !videoRef.current.paused) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;

            setCurrentTime(currentTime);
            setDuration(duration);

            if (duration && !isNaN(duration)) {
                const progress = (currentTime / duration) * 100;
                const lessonIdStr = lessonId.toString();

                // Calculate the current 10% milestone
                const currentMilestone = Math.floor(progress / 10) * 10;

                setVideoProgress((prev) => {
                    const newProgress = { ...prev, [lessonIdStr]: progress };
                    return newProgress;
                });

                // Handle seeking restrictions and get the new last valid time
                let newLastValidTime: number = currentTime;
                if (isSkippable) {
                    setLastValidTime((prev) => {
                        newLastValidTime = Math.max(prev[lessonIdStr] || 0, currentTime);
                        return { ...prev, [lessonIdStr]: newLastValidTime };
                    });
                } else {
                    // Development mode - allow any time
                    setLastValidTime((prev) => {
                        return { ...prev, [lessonIdStr]: currentTime };
                    });
                }

                // Update progress on server when reaching new 10% milestones
                if (currentMilestone >= 10) {
                    const lessonMilestones = completedMilestones[lessonIdStr] || new Set<number>();

                    // Check if this milestone hasn't been reached before
                    if (!lessonMilestones.has(currentMilestone)) {
                        setCompletedMilestones((prev) => {
                            const newMilestones = new Set(lessonMilestones);
                            newMilestones.add(currentMilestone);
                            console.log(`Reached ${currentMilestone}% milestone for lesson ${lessonId}`);
                            updateLessonProgress(lessonId, currentMilestone, newLastValidTime);

                            return { ...prev, [lessonIdStr]: newMilestones };
                        });
                    }
                }

                // Also update every 30 seconds for more granular progress tracking (but less frequent than milestones)
                if (Math.floor(currentTime) % 30 === 0 && Math.floor(currentTime) > 0) {
                    updateLessonProgress(lessonId, Math.round(progress), newLastValidTime);
                }
            }
        }
    };

    // Function to update lesson progress on server
    const updateLessonProgress = useCallback(async (lessonId: string | number, progressPercentage: number, lastValidTime: number = 0) => {
        if (!user?.AccountID) return;

        try {
            await apiUtils.courses.updateLessonProgress(Number(id), Number(lessonId), {
                accountId: user.AccountID,
                completionPercentage: progressPercentage,
                lastValidTime: lastValidTime
            });

            console.log('Lesson progress updated:', {
                lessonId,
                progressPercentage,
                lastValidTime,
                accountId: user.AccountID
            });
        } catch (error) {
            console.error('Error updating lesson progress:', error);
        }
    }, [user?.AccountID, id]);

    // Function to mark lesson as completed on server
    const markLessonCompletedOnServer = useCallback(async (lessonId: string | number) => {
        if (!user?.AccountID) return;

        try {
            await apiUtils.courses.markLessonCompleted(Number(id), Number(lessonId), user.AccountID);

            console.log('Lesson completed on server:', {
                lessonId,
                accountId: user.AccountID,
                courseId: id
            });
        } catch (error) {
            console.error('Error marking lesson as completed on server:', error);
        }
    }, [user?.AccountID, id]);

    const markLessonAsCompleted = useCallback((lessonId: string | number) => {
        if (!user?.AccountID) {
            toast.error("Bạn cần đăng nhập để hoàn thành bài học");
            return;
        }

        // Ultimate atomic check: if already in progress or completed, abort immediately
        if (completionInProgressRef.current.has(lessonId) || completedLessons.has(lessonId)) {
            return;
        }

        // Mark as in progress atomically before any other checks
        completionInProgressRef.current.add(lessonId);

        // Time-based debounce check - more aggressive timing
        const now = Date.now();
        const lastTime = lastCompletionTimeRef.current.get(lessonId);
        if (lastTime && (now - lastTime) < 2000) {
            completionInProgressRef.current.delete(lessonId);
            return;
        }
        lastCompletionTimeRef.current.set(lessonId, now);

        // Process completion with single toast guarantee
        setCompletedLessons((prevCompleted) => {
            // Final atomic check inside setState
            if (prevCompleted.has(lessonId)) {
                completionInProgressRef.current.delete(lessonId);
                return prevCompleted;
            }

            const newSet = new Set(prevCompleted);
            newSet.add(lessonId);

            // Show toast only if not already shown for this lesson
            if (!completionToastShownRef.current.has(lessonId)) {
                completionToastShownRef.current.add(lessonId);
                toast.success("🎉 Bài học đã được hoàn thành!");
            }

            // Mark lesson as completed on server
            markLessonCompletedOnServer(lessonId);

            // Schedule cleanup and course completion check
            setTimeout(() => {
                checkCourseCompletion();
                completionInProgressRef.current.delete(lessonId);
            }, 1500);

            return newSet;
        });
    }, [user?.AccountID, completedLessons, checkCourseCompletion, markLessonCompletedOnServer]);

    const handleLessonCompletion = useCallback((lessonId: string | number) => {
        // Immediate atomic check
        if (completionInProgressRef.current.has(lessonId) || completedLessons.has(lessonId)) {
            return;
        }
        markLessonAsCompleted(lessonId);
    }, [markLessonAsCompleted, completedLessons]);

    const canAccessLesson = (lessonIndex: number): boolean => {
        if (lessonIndex === 0) return true; // First lesson is always accessible

        if (!lesson) return false;

        // Check if previous lesson is completed
        const previousLessonId = lesson[lessonIndex - 1].LessonID;
        return completedLessons.has(previousLessonId);
    };

    const handleVideoEnded = useCallback((lessonId: string | number) => {
        // Immediate atomic check
        if (completionInProgressRef.current.has(lessonId) || completedLessons.has(lessonId)) {
            setIsPlaying(false);
            return;
        }
        markLessonAsCompleted(lessonId);
        setIsPlaying(false);
    }, [markLessonAsCompleted, completedLessons]);

    const handleVideoSeeking = (lessonId: string | number) => {
        if (videoRef.current) {
            isSeekingRef.current = true;
            const currentTime = videoRef.current.currentTime;
            const lastValid = lastValidTime[lessonId.toString()] || 0;

            if (isSkippable && currentTime > lastValid + 2) {
                videoRef.current.currentTime = lastValid;
                toast.warning("Bạn cần xem video tuần tự để hoàn thành bài học");
            }
        }
    };

    const handleVideoSeeked = () => {
        setTimeout(() => {
            isSeekingRef.current = false;
        }, 100);
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume;
                setIsMuted(false);
            } else {
                videoRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
    };

    const toggleFullscreen = () => {
        if (playerRef.current) {
            if (!isFullscreen) {
                if (playerRef.current.requestFullscreen) {
                    playerRef.current.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
            setIsFullscreen(!isFullscreen);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (seekTime: number) => {
        if (videoRef.current) {
            const lessonId = selected.toString();
            const lastValid = lastValidTime[lessonId] || 0;

            if (isSkippable && seekTime > lastValid + 2) {
                toast.warning("Bạn cần xem video tuần tự để hoàn thành bài học");
                return;
            }

            videoRef.current.currentTime = seekTime;
        }
    };

    const renderVideoLesson = (currentLesson: sqlLesson) => {
        if (!currentLesson.VideoUrl) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
                    <div className="text-center text-white">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400">Không có video cho bài học này</p>
                    </div>
                </div>
            );
        }

        const progress = videoProgress[currentLesson.LessonID.toString()] || 0;
        const isCompleted = completedLessons.has(currentLesson.LessonID);

        return (
            <div ref={playerRef} className="relative w-full bg-black rounded-lg overflow-hidden">
                <video
                    ref={videoRef}
                    className="w-full h-auto cursor-pointer"
                    onTimeUpdate={() => handleVideoTimeUpdate(currentLesson.LessonID)}
                    onEnded={() => handleVideoEnded(currentLesson.LessonID)}
                    onSeeking={() => handleVideoSeeking(currentLesson.LessonID)}
                    onSeeked={handleVideoSeeked}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                        if (videoRef.current) {
                            setDuration(videoRef.current.duration);
                        }
                    }}
                    onClick={togglePlayPause}
                    src={currentLesson.VideoUrl}
                    preload="metadata"
                />

                {/* Custom Controls Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}>

                    {/* Top Controls */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-lg">{currentLesson.Title}</h3>
                            {isCompleted && (
                                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Hoàn thành
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                                {Math.round(progress)}%
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={togglePlayPause}
                            className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 transform hover:scale-110"
                        >
                            {isPlaying ? (
                                <Pause className="w-8 h-8" />
                            ) : (
                                <Play className="w-8 h-8 ml-1" />
                            )}
                        </button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                                <div
                                    className="absolute left-0 top-0 h-full bg-white/30"
                                    style={{ width: `${(lastValidTime[currentLesson.LessonID.toString()] || 0) / duration * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={(e) => handleSeek(Number(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlayPause}
                                    className="text-white hover:text-blue-400 transition-colors"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6" />
                                    ) : (
                                        <Play className="w-6 h-6" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleSeek(0)}
                                    className="text-white hover:text-blue-400 transition-colors"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleMute}
                                        className="text-white hover:text-blue-400 transition-colors"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                        className="w-20 h-1 bg-white/20 rounded-full outline-none"
                                    />
                                </div>

                                <div className="text-white text-sm">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-white" />
                                    <select
                                        value={playbackSpeed}
                                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                                        className="bg-white/20 text-white text-sm border-none rounded px-2 py-1"
                                    >
                                        <option value={0.5}>0.5x</option>
                                        <option value={0.75}>0.75x</option>
                                        <option value={1}>1x</option>
                                        <option value={1.25}>1.25x</option>
                                        <option value={1.5}>1.5x</option>
                                        <option value={2}>2x</option>
                                    </select>
                                </div>

                                <button
                                    onClick={toggleFullscreen}
                                    className="text-white hover:text-blue-400 transition-colors"
                                >
                                    <Maximize className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLessonContent = (currentLesson: sqlLesson) => {
        const isCompleted = completedLessons.has(currentLesson.LessonID);
        const progress = videoProgress[currentLesson.LessonID.toString()] || 0;

        return (
            <div className="space-y-8">
                {/* Lesson Header */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                                {isCompleted ? (
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                ) : (
                                    <Video className="w-8 h-8 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.Title}</h1>
                                {currentLesson.Duration && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-500">{currentLesson.Duration} phút</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Tiến độ xem</div>
                            <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Video Player */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Video className="w-6 h-6 text-blue-600" />
                        Video bài học
                    </h2>
                    {currentLesson.VideoUrl && renderVideoLesson(currentLesson)}
                </div>

                {/* Lesson Content */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-gray-600" />
                        Nội dung bài học
                    </h2>
                    <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {currentLesson.Content}
                        </div>
                    </div>
                </div>

                {/* Completion Status */}
                {isCompleted ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-green-800">
                            <CheckCircle className="w-6 h-6" />
                            <div>
                                <h3 className="font-semibold text-lg">Bài học đã hoàn thành!</h3>
                                <p className="text-sm text-green-700">Bạn đã xem hết video và hoàn thành bài học này.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-blue-800">
                                <Video className="w-6 h-6" />
                                <div>
                                    <h3 className="font-semibold text-lg">Hoàn thành bài học</h3>
                                    <p className="text-sm text-blue-700">Bấm nút bên dưới để đánh dấu hoàn thành bài học này.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleLessonCompletion(currentLesson.LessonID)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Hoàn thành
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderSidebar = () => {
        if (!lesson || lesson.length === 0) {
            return (
                <div className="w-80 bg-white rounded-lg shadow-sm p-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-80 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <h3 className="font-semibold text-lg mb-2">Nội dung khóa học</h3>
                    <div className="flex items-center gap-2 text-blue-100">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">
                            {completedLessons.size} / {lesson.length} bài học
                        </span>
                    </div>
                    <div className="mt-3 bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedLessons.size / lesson.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                    {lesson.map((lessonItem, index) => {
                        const isCompleted = completedLessons.has(lessonItem.LessonID);
                        const isActive = selected === lessonItem.LessonID;
                        const progress = videoProgress[lessonItem.LessonID.toString()] || 0;
                        const canAccess = canAccessLesson(index);

                        return (
                            <button
                                key={lessonItem.LessonID}
                                onClick={() => {
                                    if (canAccess) {
                                        setSelected(lessonItem.LessonID);
                                    } else {
                                        toast.error("Bạn cần hoàn thành bài học trước đó để mở khóa bài học này!");
                                    }
                                }}
                                disabled={!canAccess}
                                className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                                    : canAccess
                                        ? 'hover:bg-gray-50 border-2 border-transparent'
                                        : 'bg-gray-50 border-2 border-transparent opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full flex-shrink-0 ${isCompleted ? 'bg-green-100' : canAccess ? 'bg-gray-100' : 'bg-gray-50'
                                        }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : canAccess ? (
                                            <span className="w-4 h-4 flex items-center justify-center text-xs font-medium text-gray-600">
                                                {index + 1}
                                            </span>
                                        ) : (
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm truncate ${isActive ? 'text-blue-900' : canAccess ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {lessonItem.Title}
                                        </h4>
                                        <p className={`text-xs mt-1 line-clamp-2 ${canAccess ? 'text-gray-600' : 'text-gray-400'
                                            }`}>
                                        </p>
                                        {!canAccess && (
                                            <p className="text-xs text-orange-600 mt-1">
                                                Hoàn thành bài học trước để mở khóa
                                            </p>
                                        )}
                                        {lessonItem.Duration && (
                                            <div className="flex items-center gap-1 mt-2">
                                                <Clock className={`w-3 h-3 ${canAccess ? 'text-gray-500' : 'text-gray-400'}`} />
                                                <span className={`text-xs ${canAccess ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {lessonItem.Duration} phút
                                                </span>
                                            </div>
                                        )}
                                        {progress > 0 && canAccess && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-1">
                                                    <div
                                                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {/* Exam Section - Always visible like old format */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <button
                            onClick={() => setSelected("exam")}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selected === "exam"
                                ? 'bg-orange-50 border-2 border-orange-200 shadow-sm'
                                : 'hover:bg-gray-50 border-2 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${lesson && completedLessons.size === lesson.length ? 'bg-orange-100' : 'bg-gray-100'
                                    }`}>
                                    <Target className={`w-4 h-4 ${lesson && completedLessons.size === lesson.length ? 'text-orange-600' : 'text-gray-400'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-medium text-sm ${selected === "exam" ? 'text-orange-900' : 'text-gray-900'
                                        }`}>
                                        Bài kiểm tra
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Kiểm tra kiến thức đã học
                                    </p>
                                    {lesson && completedLessons.size !== lesson.length && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            Hoàn thành tất cả bài học để mở khóa
                                        </p>
                                    )}
                                </div>
                                {selected === "exam" && (
                                    <ChevronRight className="w-4 h-4 text-orange-600" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!lesson || lesson.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải bài học...</p>
                </div>
            </div>
        );
    }

    const currentLesson = lesson.find(l => l.LessonID === selected);

    // Handle exam selection
    if (selected === "exam") {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <Link
                                    to={`/courses/${id}`}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Quay lại khóa học</span>
                                </Link>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Target className="w-4 h-4" />
                                    <span>Bài kiểm tra</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <div className="flex-shrink-0">
                            {renderSidebar()}
                        </div>

                        {/* Exam Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <div className="text-center">
                                    <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                                        <Target className="w-12 h-12 text-orange-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        Bài kiểm tra khóa học
                                    </h1>
                                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                        Hoàn thành bài kiểm tra để đánh giá kiến thức bạn đã học được trong khóa học này.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                            <h3 className="font-semibold text-gray-900 mb-1">Kiến thức tổng hợp</h3>
                                            <p className="text-sm text-gray-600">Câu hỏi bao gồm toàn bộ kiến thức trong khóa học</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <h3 className="font-semibold text-gray-900 mb-1">Thời gian làm bài</h3>
                                            <p className="text-sm text-gray-600">30 phút để hoàn thành bài kiểm tra</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                            <h3 className="font-semibold text-gray-900 mb-1">Kết quả</h3>
                                            <p className="text-sm text-gray-600">Xem kết quả ngay sau khi hoàn thành</p>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                                        <div className="flex items-center gap-2 text-yellow-800">
                                            <Award className="w-5 h-5" />
                                            <p className="text-sm">
                                                <strong>Lưu ý:</strong> Bạn cần hoàn thành tất cả bài học trước khi làm bài kiểm tra
                                            </p>
                                        </div>
                                    </div>

                                    {lesson && completedLessons.size === lesson.length ? (
                                        <Link
                                            to={`/courses/${id}/exam`}
                                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                                            state={
                                                {
                                                    courseId: id,
                                                    lessons: lesson
                                                }
                                            }
                                        >
                                            <Target className="w-5 h-5" />
                                            Bắt đầu làm bài
                                        </Link>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 bg-gray-300 text-gray-600 px-8 py-3 rounded-lg font-semibold cursor-not-allowed">
                                            <Target className="w-5 h-5" />
                                            Hoàn thành tất cả bài học để mở khóa
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentLesson) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không tìm thấy bài học</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                to={`/courses/${id}`}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Quay lại khóa học</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Award className="w-4 h-4" />
                                <span>{completedLessons.size} / {lesson.length} bài học</span>
                            </div>

                            {courseCompleted && (
                                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Khóa học hoàn thành</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="flex-shrink-0">
                        {renderSidebar()}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {renderLessonContent(currentLesson)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonDetailsPage;
