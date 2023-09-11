import { MS_TO_SECONDS } from '@/utils/constant/index';
const TIME_MEASUREMENT = 60;
Math.easeInOutQuad = function(t, b, c, d) {
  const DOUBLE = 2;
  t /= d / DOUBLE;
  if (t < 1) {
    return c / DOUBLE * t * t + b;
  }
  t--;
  return -c / DOUBLE * (t * (t - DOUBLE) - 1) + b;
};

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
var requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, MS_TO_SECONDS / TIME_MEASUREMENT); };
})();

/**
 * Because it's so fucking difficult to detect the scrolling element, just move them all
 * @param {number} amount
 */
function move(amount) {
  document.documentElement.scrollTop = amount;
  document.body.parentNode.scrollTop = amount;
  document.body.scrollTop = amount;
}

function position() {
  return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
}

/**
 * @param {number} to
 * @param {number} duration
 * @param {Function} callback
 */
export function scrollTo(to, duration, callback) {
  const DEFAULT_DURATION = 500;
  const start = position();
  const change = to - start;
  const increment = 20;
  let currentTime = 0;
  duration = (typeof (duration) === 'undefined') ? DEFAULT_DURATION : duration;
  var animateScroll = function() {
    // increment the time
    currentTime += increment;
    // find the value with the quadratic in-out easing function
    var val = Math.easeInOutQuad(currentTime, start, change, duration);
    // move the document.body
    move(val);
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll);
    } else {
      if (callback && typeof (callback) === 'function') {
        // the animation is done so lets callback
        callback();
      }
    }
  };
  animateScroll();
}
