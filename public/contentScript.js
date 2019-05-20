let JD = 'https://union-click.jd.com/jdc?e=&p=AyIGZRprEAAQA1UaXyVGTV8LRGtMR1dGFxBFC1pXUwkEBwpZRxgHRQcLREJEAQUcTVZUGAVJHk1cTQkTSxhBekcLUBlZEQITA2VfJnVfdHc0BTlleBdTImgDF0JVY1NNVxkyEzdWGFoRARYDVx9rJQIVNwN1WxQDEwZUGlsWBCIGZRtfEQsQBFYbWhEGFgdlHFscMldeAVkLQFFMT2UraxYyIjdVK1glQHwEUhpfFQFFDwcTXhYHQFBdS1xCCxtSAhlTRwIQVAdOUiUAEwZREg%3D%3D&t=W1dCFFlQCxxKQgFHREkdSVJKSQVJHFRXFk9FUlpGQUpLCVBaTFhbXQtWVmpSWR5ZFwYSBlE%3D';
window.addEventListener('load', () => {
  let iframe = document.createElement('iframe');
  iframe.setAttribute('src', JD);
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);
  iframe.onload = () => {
    setTimeout(_ => {
      document.body.removeChild(iframe);
    }, 1000);
  };
});
