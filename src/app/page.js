"use client"
// File: pages/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    setIsIOS(detectIOS());

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check notification permission on load
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('This app is either already installed or not installable on this device/browser.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleNotificationClick = async () => {
    if (isIOS) {
      // iOS fallback - show an alert or in-app notification
      showIOSFallbackNotification();
      return;
    }

    if (!('Notification' in window)) {
      // Fallback for browsers without notification support
      alert('This browser does not support notifications. You will receive in-app notifications instead.');
      showFallbackNotification();
      return;
    }

    if (Notification.permission === 'granted') {
      sendNotification();
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          sendNotification();
        } else {
          // Permission denied, show fallback
          showFallbackNotification();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        showFallbackNotification();
      }
    } else {
      // Permission was previously denied
      showFallbackNotification();
    }
  };

  const sendNotification = () => {
    try {
      const notification = new Notification('Hello from PWA!', {
        body: 'This is a notification from your PWA app.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png', // For Android
        vibrate: [200, 100, 200], // Vibration pattern
        tag: 'pwa-notification', // Group similar notifications
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      showFallbackNotification();
    }
  };

  // Fallback for iOS or browsers without notification support
  const showIOSFallbackNotification = () => {
    // Create an in-app notification for iOS
    const notificationElement = document.createElement('div');
    notificationElement.className = 'ios-notification';
    notificationElement.innerHTML = `
      <div class="notification-icon">
        <img src="/icon-192x192.png" alt="Notification" width="30" height="30" />
      </div>
      <div class="notification-content">
        <h4>Hello from PWA!</h4>
        <p>This is a notification from your PWA app.</p>
      </div>
      <button class="notification-close">×</button>
    `;

    document.body.appendChild(notificationElement);

    // Add animation
    setTimeout(() => {
      notificationElement.classList.add('show');
    }, 10);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notificationElement.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notificationElement);
      }, 300);
    }, 5000);

    // Handle close button
    const closeButton = notificationElement.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notificationElement.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notificationElement);
      }, 300);
    });
  };

  // Generic fallback notification
  const showFallbackNotification = () => {
    // You can customize this based on the platform
    if (isIOS) {
      showIOSFallbackNotification();
    } else {
      // For other platforms without notification support
      alert('Notification: Hello from PWA!');
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Simple PWA App</title>
        <meta name="description" content="A simple PWA with Next.js" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3367D6" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>

      <main className="main">
        <h1 className="title">Simple PWA App</h1>

        <div className="image-container">
          <Image
            src="/ladybug.jpg"
            alt="PWA Demo Image"
            width={400}
            height={300}
            className="demo-image"
            priority
            quality={80}
          />
        </div>

        <div className="buttons">
          <button
            onClick={handleInstallClick}
            disabled={isInstalled}
            className="button install-button"
          >
            {isInstalled ? 'App Installed' : 'Install App'}
          </button>

          <button
            onClick={handleNotificationClick}
            className="button notification-button"
          >
            Send Notification
            {notificationPermission !== 'granted' && !isIOS &&
              <span className="permission-note"> (Permission Required)</span>}
            {isIOS && <span className="permission-note"> (iOS Fallback)</span>}
          </button>
        </div>
      </main>

      {/* CSS remains the same but will be optimized by Next.js in production */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f7f7f7;
          padding: 1rem;
          box-sizing: border-box;
        }

        .main {
          padding: 3rem 2rem;
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
        }

        .title {
          margin: 0 0 2rem;
          line-height: 1.15;
          font-size: 2.5rem;
          text-align: center;
          color: #333;
        }

        .image-container {
          margin-bottom: 2rem;
          border-radius: 8px;
          overflow: hidden;
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .demo-image {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
        }

        .buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }

        .button {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .install-button {
          background-color: #4285f4;
          color: white;
        }

        .install-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .notification-button {
          background-color: #34a853;
          color: white;
          position: relative;
        }

        .permission-note {
          font-size: 0.7rem;
          opacity: 0.8;
          margin-left: 5px;
        }

        .button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .button:active:not(:disabled) {
          transform: translateY(0);
        }

        /* iOS Notification Styles */
        .ios-notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          width: 90%;
          max-width: 400px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          z-index: 9999;
          transition: transform 0.3s ease-out;
        }

        .ios-notification.show {
          transform: translateX(-50%) translateY(0);
        }

        .notification-icon {
          margin-right: 12px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .notification-content p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .notification-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #999;
          cursor: pointer;
          padding: 0 4px;
        }

        @media (max-width: 600px) {
          .title {
            font-size: 1.8rem;
          }

          .main {
            padding: 2rem 1rem;
          }

          .buttons {
            max-width: 250px;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        * {
          box-sizing: border-box;
        }

        #__next {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
