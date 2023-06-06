export declare global {
    interface Window {
      webAudio: AudioContext; 
      intervals: Array<number>; 
      loops: Array<Loop>; 
    }
}

// window.webAudio = window.webAudio || {};