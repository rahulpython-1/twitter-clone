import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) {
    console.warn('formatDate received null/undefined date');
    return 'Just now';
  }
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('formatDate received invalid date:', date);
    return 'Just now';
  }
  
  const now = new Date();
  const diffInHours = (now - dateObj) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } else if (diffInHours < 168) {
    return format(dateObj, 'MMM d');
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function extractHashtags(text) {
  const hashtagRegex = /#(\w+)/g;
  return text.match(hashtagRegex) || [];
}

export function extractMentions(text) {
  const mentionRegex = /@(\w+)/g;
  return text.match(mentionRegex) || [];
}

export function linkifyText(text) {
  // Convert URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">$1</a>');

  // Convert hashtags to links
  const hashtagRegex = /#(\w+)/g;
  text = text.replace(hashtagRegex, '<a href="/search/hashtag/$1" class="text-primary-500 hover:underline">#$1</a>');

  // Convert mentions to links
  const mentionRegex = /@(\w+)/g;
  text = text.replace(mentionRegex, '<a href="/$1" class="text-primary-500 hover:underline">@$1</a>');

  return text;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUsername(username) {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
}

export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
