"use client"
// File: pages/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image'; // Add Next.js Image component

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
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
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      sendNotification();
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        sendNotification();
      }
    }
  };

  const sendNotification = () => {
    const notification = new Notification('Hello from PWA!', {
      body: 'This is a notification from your PWA app.',
      icon: '/icon-192x192.png'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
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
          {/* Replace standard img with Next.js Image component */}
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
            {notificationPermission !== 'granted' &&
              <span className="permission-note"> (Permission Required)</span>}
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
