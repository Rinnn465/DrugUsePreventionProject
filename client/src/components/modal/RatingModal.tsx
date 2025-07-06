import React, { useState } from 'react';
import { Star, X, MessageCircle } from 'lucide-react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment?: string) => void;
    appointmentId: number;
    isConsultant: boolean;
}

const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isConsultant
}) => {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');

    if (!isOpen) return null;

    const handleStarClick = (starValue: number) => {
        setRating(starValue);
    };

    const handleStarHover = (starValue: number) => {
        setHoveredRating(starValue);
    };

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, comment.trim() || undefined);
        }
    };

    const getRatingText = (ratingValue: number) => {
        switch (ratingValue) {
            case 1: return '1 sao - Rất không hài lòng';
            case 2: return '2 sao - Không hài lòng';
            case 3: return '3 sao - Bình thường';
            case 4: return '4 sao - Hài lòng';
            case 5: return '5 sao - Rất hài lòng';
            default: return 0;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Đánh giá cuộc hẹn</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <p className="text-blue-100 mt-2">
                        {isConsultant
                            ? 'Đánh giá về trải nghiệm tư vấn của bạn'
                            : null
                        }
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Star Rating */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Mức độ hài lòng của bạn
                        </h3>

                        {/* Stars */}
                        <div className="flex justify-center items-center space-x-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 transition-colors ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Rating Text */}
                        <p className="text-sm font-medium text-gray-600">
                            {getRatingText(hoveredRating || rating)}
                        </p>
                    </div>

                    {/* Comment Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <MessageCircle className="h-4 w-4 inline mr-2" />
                            Nhận xét thêm (tùy chọn)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={
                                isConsultant
                                    ? 'Chia sẻ trải nghiệm của bạn về cuộc tư vấn này...'
                                    : 'Chia sẻ cảm nhận của bạn về chất lượng tư vấn...'
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {comment.length}/500 ký tự
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            💡 Gợi ý đánh giá
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            {isConsultant ? (
                                <>
                                    <li>• Khách hàng có hợp tác tốt trong quá trình tư vấn không?</li>
                                    <li>• Chất lượng kết nối và âm thanh có ổn định không?</li>
                                    <li>• Thời gian tư vấn có phù hợp không?</li>
                                </>
                            ) : (
                                <>
                                    <li>• Chuyên viên có tư vấn rõ ràng, dễ hiểu không?</li>
                                    <li>• Bạn có cảm thấy được lắng nghe và hỗ trợ tốt không?</li>
                                    <li>• Chất lượng cuộc gọi có ổn định không?</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0}
                            className={`flex-1 px-4 py-3 rounded-xl transition-colors font-medium ${rating > 0
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Gửi đánh giá
                        </button>
                    </div>

                    {rating === 0 && (
                        <p className="text-center text-xs text-red-500 mt-2">
                            Vui lòng chọn số sao để đánh giá
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
