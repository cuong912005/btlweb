import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';
import { 
  isPushSupported, 
  subscribeToPush, 
  unsubscribeFromPush,
  isPushSubscribed 
} from '../../../utils/pushNotifications';

const PushNotificationToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscribeToPush: subscribeToBackend, unsubscribeFromPush: unsubscribeFromBackend, getVapidPublicKey } = useNotificationStore();

  // Check initial subscription status
  useEffect(() => {
    const checkStatus = async () => {
      if (!isPushSupported()) {
        return;
      }

      const subscribed = await isPushSubscribed();
      setIsEnabled(subscribed);
    };

    checkStatus();
  }, []);

  const handleToggle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (isEnabled) {
        // Get subscription endpoint before unsubscribing
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        const endpoint = subscription?.endpoint;

        // Unsubscribe from browser
        await unsubscribeFromPush();
        
        // Unsubscribe from backend if we have endpoint
        if (endpoint) {
          await unsubscribeFromBackend(endpoint);
        }
        
        setIsEnabled(false);
      } else {
        // Subscribe
        const { success, publicKey, error: keyError } = await getVapidPublicKey();
        
        if (!success) {
          throw new Error(keyError || 'Không thể lấy VAPID key');
        }

        const subscription = await subscribeToPush(publicKey);
        const { success: backendSuccess, error: backendError } = await subscribeToBackend(subscription);
        
        if (!backendSuccess) {
          throw new Error(backendError || 'Không thể đăng ký với server');
        }

        setIsEnabled(true);
      }
    } catch (err) {
      console.error('Push notification toggle error:', err);
      setError(err.message || 'Đã xảy ra lỗi');
      // Revert state if failed
      setIsEnabled(!isEnabled);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPushSupported()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <BellOff className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Thông báo đẩy không được hỗ trợ
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Trình duyệt của bạn không hỗ trợ thông báo đẩy. Vui lòng sử dụng trình duyệt hiện đại hơn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-start flex-1">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Thông báo đẩy
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEnabled 
                ? 'Bạn sẽ nhận được thông báo ngay cả khi không mở ứng dụng'
                : 'Bật để nhận thông báo tức thì về các hoạt động'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            isEnabled ? 'bg-primary-600' : 'bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default PushNotificationToggle;
